import type { Ref } from 'vue'
import type { IPersonConfig } from '@/types/storeType'
import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { inject, ref, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toast-notification'
import * as XLSX from 'xlsx'
import { loadingKey } from '@/components/Loading'
import i18n from '@/locales/i18n'
import useStore from '@/store'
import { addOtherInfo } from '@/utils'
import { readFileBinary, readLocalFileAsArraybuffer } from '@/utils/file'
import { getActivityLotteryId } from '@/utils/auth'
import { tableColumns } from './columns'
import ImportExcelWorker from './importExcel.worker?worker'
import {
  activity_lottery_user_list,
  activity_lottery_user_import,
  activity_lottery_user_delete,
  activity_lottery_user_reset,
  activity_lottery_user_export,
} from '@/api/activity'

type IBasePersonConfig = Pick<IPersonConfig, 'uid' | 'name' | 'department' | 'identity' | 'avatar'>

export function useViewModel({ exportInputFileRef }: { exportInputFileRef: Ref<HTMLInputElement> }) {
  const { t } = useI18n()
  const baseUrl = import.meta.env.BASE_URL
  const toast = useToast()
  const worker: Worker | null = new ImportExcelWorker()
  const loading = inject(loadingKey)
  const personConfig = useStore().personConfig
  const { getAllPersonList: allPersonList, getAlreadyPersonList: alreadyPersonList } = storeToRefs(personConfig)
  const tableColumnList = tableColumns({ handleDeletePerson: delPersonItem })
  const addPersonModalVisible = ref(false)
  const singlePersonData = ref<IBasePersonConfig>({
    uid: '',
    name: '',
    department: '',
    avatar: '',
    identity: '',
  })

  // 人员列表数据(从API获取)
  const personListData = ref<IPersonConfig[]>([])

  /**
   * 从API获取人员列表
   */
  async function fetchPersonList() {
    try {
      const activityLotteryId = getActivityLotteryId()
      if (!activityLotteryId) {
        toast.open({
          message: '缺少activity_lottery_id',
          type: 'error',
          position: 'top-right',
        })
        return
      }

      const response = await activity_lottery_user_list({
        activity_lottery_id: activityLotteryId,
      })

      if (response.code === 200 && response.data) {
        // API返回的直接是数组结构,数据在data中
        personListData.value = response.data || []
        // 同步更新到本地store(保持兼容性)
        personConfig.resetPerson()
        personConfig.addNotPersonList(personListData.value)
      }
    }
    catch (error: any) {
      console.error('获取人员列表失败:', error)
      toast.open({
        message: error.message || '获取人员列表失败',
        type: 'error',
        position: 'top-right',
      })
    }
  }
  async function getExcelTemplateContent() {
    const locale = i18n.global.locale.value
    if (locale === 'zhCn') {
      const templateData = await readLocalFileAsArraybuffer(`${import.meta.env.BASE_URL}人口登记表-zhCn.xlsx`)
      return templateData
    }
    else {
      const templateData = await readLocalFileAsArraybuffer(`${import.meta.env.BASE_URL}personListTemplate-en.xlsx`)
      return templateData
    }
  }
  /// 向worker发送消息
  function sendWorkerMessage(message: any) {
    if (worker) {
      worker.postMessage(message)
    }
  }
  /// 开始导入
  async function startWorker(data: string) {
    loading?.show()
    getExcelTemplateContent()
    sendWorkerMessage({ type: 'start', data, templateData: await getExcelTemplateContent() })
  }
  /**
   * 获取用户数据 - 通过API导入
   */
  async function handleFileChange(e: Event) {
    try {
      const file = ((e.target as HTMLInputElement).files as FileList)[0]
      if (!file) return

      loading?.show()

      const activityLotteryId = getActivityLotteryId()
      if (!activityLotteryId) {
        toast.open({
          message: '缺少activity_lottery_id',
          type: 'error',
          position: 'top-right',
        })
        loading?.hide()
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('activity_lottery_id', String(activityLotteryId))

      const response = await activity_lottery_user_import(formData)

      if (response.code === 200) {
        toast.open({
          message: t('error.importSuccess'),
          type: 'success',
          position: 'top-right',
        })
        // 重新获取人员列表
        await fetchPersonList()
        clearFileInput()
      }
      else {
        throw new Error(response.message || '导入失败')
      }
    }
    catch (error: any) {
      console.error('导入失败:', error)
      toast.open({
        message: error.message || t('error.importFail'),
        type: 'error',
        position: 'top-right',
      })
    }
    finally {
      loading?.hide()
    }
  }
  // 清空file input
  function clearFileInput() {
    if (exportInputFileRef.value) {
      exportInputFileRef.value.value = ''
    }
  }
  // 导出数据 - 通过API
  async function exportData() {
    try {
      loading?.show()
      const activityLotteryId = getActivityLotteryId()
      if (!activityLotteryId) {
        toast.open({
          message: '缺少activity_lottery_id',
          type: 'error',
          position: 'top-right',
        })
        return
      }

      const response = await activity_lottery_user_export({ activity_lottery_id: activityLotteryId })

      // 处理文件下载
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `人员列表_${new Date().getTime()}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.open({
        message: '导出成功',
        type: 'success',
        position: 'top-right',
      })
    }
    catch (error: any) {
      console.error('导出失败:', error)
      toast.open({
        message: error.message || '导出失败',
        type: 'error',
        position: 'top-right',
      })
    }
    finally {
      loading?.hide()
    }
  }

  async function resetData() {
    try {
      loading?.show()
      const activityLotteryId = getActivityLotteryId()
      if (!activityLotteryId) {
        toast.open({
          message: '缺少activity_lottery_id',
          type: 'error',
          position: 'top-right',
        })
        return
      }

      const response = await activity_lottery_user_reset({ activity_lottery_id: activityLotteryId })

      if (response.code === 200) {
        toast.open({
          message: '重置成功',
          type: 'success',
          position: 'top-right',
        })
        // 重新获取人员列表
        await fetchPersonList()
      }
      else {
        throw new Error(response.message || '重置失败')
      }
    }
    catch (error: any) {
      console.error('重置失败:', error)
      toast.open({
        message: error.message || '重置失败',
        type: 'error',
        position: 'top-right',
      })
    }
    finally {
      loading?.hide()
    }
  }

  async function deleteAll() {
    try {
      loading?.show()
      const activityLotteryId = getActivityLotteryId()
      if (!activityLotteryId) {
        toast.open({
          message: '缺少activity_lottery_id',
          type: 'error',
          position: 'top-right',
        })
        return
      }

      // 获取所有人员的lottery_code
      const lotteryCodes = allPersonList.value.map(person => person.lottery_code || person.uid).filter(Boolean)

      if (lotteryCodes.length === 0) {
        toast.open({
          message: '没有可删除的人员',
          type: 'info',
          position: 'top-right',
        })
        loading?.hide()
        return
      }

      const response = await activity_lottery_user_delete({
        activity_lottery_id: activityLotteryId,
        lottery_codes: lotteryCodes,
      })

      if (response.code === 200) {
        toast.open({
          message: '删除成功',
          type: 'success',
          position: 'top-right',
        })
        // 重新获取人员列表
        await fetchPersonList()
      }
      else {
        throw new Error(response.message || '删除失败')
      }
    }
    catch (error: any) {
      console.error('删除失败:', error)
      toast.open({
        message: error.message || '删除失败',
        type: 'error',
        position: 'top-right',
      })
    }
    finally {
      loading?.hide()
    }
  }

  async function delPersonItem(row: IPersonConfig) {
    try {
      loading?.show()
      const activityLotteryId = getActivityLotteryId()
      if (!activityLotteryId) {
        toast.open({
          message: '缺少activity_lottery_id',
          type: 'error',
          position: 'top-right',
        })
        return
      }

      const response = await activity_lottery_user_delete({
        activity_lottery_id: activityLotteryId,
        lottery_codes: [row.lottery_code || row.uid], // 使用lottery_code字段
      })

      if (response.code === 200) {
        toast.open({
          message: '删除成功',
          type: 'success',
          position: 'top-right',
        })
        // 重新获取人员列表
        await fetchPersonList()
      }
      else {
        throw new Error(response.message || '删除失败')
      }
    }
    catch (error: any) {
      console.error('删除失败:', error)
      toast.open({
        message: error.message || '删除失败',
        type: 'error',
        position: 'top-right',
      })
    }
    finally {
      loading?.hide()
    }
  }
  function addOnePerson(addOnePersonDrawerRef: any, event: any) {
    event.preventDefault()
    // 表单中的验证信息清除

    const personData = addOtherInfo([toRaw(singlePersonData.value)])
    personData[0].id = uuidv4()
    personConfig.addOnePerson(personData)
    // singlePersonData.value = {} as IBasePersonConfig
    addOnePersonDrawerRef.closeDrawer()
    singlePersonData.value = {} as IBasePersonConfig
  }
  return {
    resetData,
    deleteAll,
    handleFileChange,
    exportData,
    alreadyPersonList,
    allPersonList,
    tableColumnList,
    addOnePerson,
    addPersonModalVisible,
    singlePersonData,
    fetchPersonList,
  }
}
