import type { IPrizeConfig } from '@/types/storeType'
import localforage from 'localforage'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useToast } from 'vue-toast-notification'
import { inject } from 'vue'
import i18n from '@/locales/i18n'
import useStore from '@/store'
import { getActivityLotteryId } from '@/utils/auth'
import { loadingKey } from '@/components/Loading'
import {
  get_prize_list,
  activity_lottery_prize_create,
  activity_lottery_prize_update,
  activity_lottery_prize_delete,
} from '@/api/activity'

export function usePrizeConfig() {
  const toast = useToast()
  const loading = inject(loadingKey)
  const imageDbStore = localforage.createInstance({
    name: 'imgStore',
  })
  const prizeConfig = useStore().prizeConfig
  const globalConfig = useStore().globalConfig
  const { getCurrentPrize: currentPrize } = storeToRefs(prizeConfig)

  const { getImageList: localImageList } = storeToRefs(globalConfig)
  const imgList = ref<any[]>([])

  const prizeList = ref<IPrizeConfig[]>([])
  const selectedPrize = ref<IPrizeConfig | null>()

  /**
   * 从API获取奖品列表
   */
  async function fetchPrizeList() {
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

      const response: any = await get_prize_list({ activity_lottery_id: activityLotteryId })

      if (response.code === 200 && response.data) {
        // 适配API返回的数据结构到前端需要的格式
        const apiPrizeList = response.data.prizes || response.data.list || []
        prizeList.value = apiPrizeList.map((item: any) => ({
          id: item.id,
          name: item.name,
          sort: item.sort,
          isAll: item.is_all === 1,
          count: item.total,
          isUsedCount: (item.total - item.remaining) || 0, // 计算已使用数量
          picture: {
            id: String(item.id),
            name: item.name,
            url: item.image,
          },
          separateCount: {
            enable: true,
            countList: item.each_lottery_limit
              ? item.each_lottery_limit.split(',').map((count: string, index: number) => ({
                id: String(index),
                count: Number.parseInt(count),
                isUsedCount: 0,
              }))
              : [],
          },
          desc: item.description || '',
          isShow: true,
          isUsed: item.is_end === '0', // 注意：is_end是字符串类型
          frequency: 1,
        }))

        // 同步更新到本地store(保持兼容性)
        prizeConfig.setPrizeConfig(prizeList.value)
      }
    }
    catch (error: any) {
      console.error('获取奖品列表失败:', error)
      toast.open({
        message: error.message || '获取奖品列表失败',
        type: 'error',
        position: 'top-right',
      })
    }
  }

  function selectPrize(item: IPrizeConfig) {
    selectedPrize.value = item
    selectedPrize.value.isUsedCount = 0
    selectedPrize.value.isUsed = false

    if (selectedPrize.value.separateCount.countList.length > 1) {
      return
    }
    selectedPrize.value.separateCount = {
      enable: true,
      countList: [
        {
          id: '0',
          count: item.count,
          isUsedCount: 0,
        },
      ],
    }
  }

  function changePrizeStatus(item: IPrizeConfig) {
    item.isUsed ? item.isUsedCount = 0 : item.isUsedCount = item.count
    item.separateCount.countList = []
    item.isUsed = !item.isUsed
  }

  function changePrizePerson(item: IPrizeConfig) {
    let indexPrize = -1
    for (let i = 0; i < prizeList.value.length; i++) {
      if (prizeList.value[i].id === item.id) {
        indexPrize = i
        break
      }
    }
    if (indexPrize > -1) {
      // 修改抽奖人数时,默认单次抽取个数为当前抽奖人数
      prizeList.value[indexPrize].separateCount.countList = [
        {
          id: '0',
          count: prizeList.value[indexPrize].count,
          isUsedCount: 0,
        },
      ]
      prizeList.value[indexPrize].isUsed ? prizeList.value[indexPrize].isUsedCount = prizeList.value[indexPrize].count : prizeList.value[indexPrize].isUsedCount = 0
    }
  }
  function submitData(value: any) {
    selectedPrize.value!.separateCount.countList = value
    selectedPrize.value = null
  }

  async function getImageDbStore() {
    const keys = await imageDbStore.keys()
    if (keys.length > 0) {
      imageDbStore.iterate((value, key) => {
        imgList.value.push({
          key,
          value,
        })
      })
    }
  }

  async function updatePrize(item: IPrizeConfig) {
    try {
      const activityLotteryId = getActivityLotteryId()
      if (!activityLotteryId) {
        throw new Error('缺少activity_lottery_id')
      }

      const updateData = {
        id: item.id,
        activity_lottery_id: activityLotteryId,
        name: item.name,
        image: item.picture.url,
        description: item.desc,
        is_all: item.isAll ? 1 : 0,
        sort: item.sort,
        total: item.count,
        level: 1,
        each_lottery_limit: item.separateCount.countList
          ? item.separateCount.countList.map(c => c.count).join(',')
          : '1',
      }

      const response: any = await activity_lottery_prize_update(updateData)

      if (response.code !== 200) {
        throw new Error(response.message || '更新失败')
      }
    }
    catch (error: any) {
      console.error('更新奖品失败:', error)
      // 重新抛出错误,让调用方处理
      throw error
    }
  }

  async function delItem(item: IPrizeConfig) {
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

      const response: any = await activity_lottery_prize_delete(item.id)

      if (response.code === 200) {
        toast.success(i18n.global.t('error.deleteSuccess'))
        // 重新获取奖品列表
        await fetchPrizeList()
      }
      else {
        throw new Error(response.message || '删除失败')
      }
    }
    catch (error: any) {
      console.error('删除奖品失败:', error)
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

  async function addPrize() {
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

      const defaultPrizeConfig = {
        activity_lottery_id: activityLotteryId,
        name: i18n.global.t('data.prizeName'),
        image: '',
        description: '',
        is_all: 0,
        sort: 0,
        total: 1,
        level: 1,
        each_lottery_limit: '1',
      }

      const response: any = await activity_lottery_prize_create(defaultPrizeConfig)

      if (response.code === 200) {
        toast.success(i18n.global.t('error.success'))
        // 重新获取奖品列表
        await fetchPrizeList()
      }
      else {
        throw new Error(response.message || '添加失败')
      }
    }
    catch (error: any) {
      console.error('添加奖品失败:', error)
      toast.open({
        message: error.message || '添加失败',
        type: 'error',
        position: 'top-right',
      })
    }
    finally {
      loading?.hide()
    }
  }

  async function resetDefault() {
    await fetchPrizeList()
    toast.success(i18n.global.t('error.success'))
  }

  async function delAll() {
    // 删除所有奖品
    for (const item of prizeList.value) {
      await delItem(item)
    }
    toast.success(i18n.global.t('error.success'))
  }

  /**
   * 保存所有奖品的修改
   */
  async function saveAll() {
    try {
      loading?.show()

      // 并行更新所有奖品
      const updatePromises = prizeList.value.map(item => updatePrize(item))
      await Promise.all(updatePromises)

      toast.success('保存成功')
      // 重新获取奖品列表以确保数据同步
      await fetchPrizeList()
    }
    catch (error: any) {
      console.error('保存失败:', error)
      toast.open({
        message: error.message || '保存失败',
        type: 'error',
        position: 'top-right',
      })
    }
    finally {
      loading?.hide()
    }
  }

  /**
   * 保存单个奖品
   */
  async function saveItem(item: IPrizeConfig) {
    try {
      loading?.show()
      await updatePrize(item)
      toast.success('保存成功')
      // 重新获取奖品列表以确保数据同步
      await fetchPrizeList()
    }
    catch (error: any) {
      console.error('保存失败:', error)
      toast.open({
        message: error.message || '保存失败',
        type: 'error',
        position: 'top-right',
      })
    }
    finally {
      loading?.hide()
    }
  }

  onMounted(() => {
    getImageDbStore()
    fetchPrizeList()
  })

  // 监听prizeList变化,自动保存到本地store
  watch(() => prizeList.value, (val: IPrizeConfig[]) => {
    prizeConfig.setPrizeConfig(val)
  }, { deep: true })

  return {
    addPrize,
    resetDefault,
    delAll,
    delItem,
    prizeList,
    currentPrize,
    selectedPrize,
    submitData,
    changePrizePerson,
    changePrizeStatus,
    selectPrize,
    localImageList,
    fetchPrizeList,
    saveAll,
    saveItem,
  }
}
