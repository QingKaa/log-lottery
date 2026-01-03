import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { activity_lottery_getToken, get_prize_list, activity_lottery_user_list, activity_lottery_user_winners_list } from '@/api/activity'
import { setToken, setActivityLotteryId, setAccessKey, clearAuthData, getAccessKey } from '@/utils/auth'
import { usePersonConfig } from '@/store/personConfig'
import { usePrizeConfig } from '@/store/prizeConfig'

/**
 * 应用初始化逻辑
 * 处理accessKey参数、获取token、清空旧数据等
 */
export function useAppInit() {
  const router = useRouter()
  const personConfig = usePersonConfig()
  const prizeConfig = usePrizeConfig()

  const isLoading = ref(true)
  const errorMsg = ref('')

  /**
   * 从URL获取accessKey参数
   */
  function getAccessKeyFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('accessKey')
  }

  /**
   * 跳转到首页
   */
  function goToHome() {
    router.push('/log-lottery/home')
  }

  /**
   * 清空所有业务数据
   */
  function clearAllData() {
    // 清空人员数据
    personConfig.reset()
    // 清空奖品数据
    prizeConfig.resetDefault()
  }

  /**
   * 获取并初始化所有数据
   */
  async function initAllData(activityLotteryId: number) {
    try {
      console.log('开始获取所有数据...')

      // 并行获取人员、中奖人员和奖品配置
      const [personResponse, winnersResponse, prizeResponse]: any = await Promise.all([
        activity_lottery_user_list({ activity_lottery_id: activityLotteryId }),
        activity_lottery_user_winners_list(),
        get_prize_list({ activity_lottery_id: activityLotteryId }),
      ])

      // 处理人员列表
      if (personResponse.code === 200 && personResponse.data) {
        // API返回的直接是数组结构,数据在data中
        const personList = personResponse.data || []
        // 适配API返回的人员数据格式到前端格式
        const adaptedPersonList = personList.map((item: any) => ({
          id: item.id,
          uid: item.lottery_code || item.uid || '',
          uuid: item.uuid || '',
          name: item.name || '',
          department: item.department || '',
          identity: item.identity || '',
          avatar: item.avatar || '',
          isWin: item.is_winner || false,
          x: item.x || 0,
          y: item.y || 0,
          createTime: item.created_at || new Date().toISOString(),
          updateTime: item.updated_at || new Date().toISOString(),
          prizeName: item.prize_name || [],
          prizeId: item.prize_id || [],
          prizeTime: item.prize_time || [],
          // API新增字段
          lottery_code: item.lottery_code,
          phone: item.phone || '',
          company: item.company || '',
          position: item.position || '',
          is_sign: item.is_sign,
          is_winner: item.is_winner,
          prizes: item.prizes || [],
        }))

        // 清空并添加人员数据
        personConfig.reset()
        personConfig.addNotPersonList(adaptedPersonList)
        console.log(`✅ 人员列表加载完成，共 ${adaptedPersonList.length} 人`)
      }

      // 处理中奖人员列表
      if (winnersResponse.code === 200 && winnersResponse.data) {
        const winnersList = winnersResponse.data.list || winnersResponse.data || []
        console.log(`✅ 中奖人员列表加载完成，共 ${winnersList.length} 人`)
        // 中奖人员已经在personList中标记为isWin=true
      }

      // 处理奖品列表
      if (prizeResponse.code === 200 && prizeResponse.data) {
        const prizeList = prizeResponse.data.prizes || prizeResponse.data.list || []
        const adaptedPrizeList = prizeList.map((item: any) => ({
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

        prizeConfig.setPrizeConfig(adaptedPrizeList)
        console.log(`✅ 奖品配置加载完成，共 ${adaptedPrizeList.length} 个奖品`)
      }

      console.log('🎉 所有数据加载完成')
    }
    catch (error: any) {
      console.error('获取数据失败:', error)
      // 不阻塞初始化流程，只记录错误
      throw error
    }
  }

  /**
   * 初始化应用
   */
  async function initApp() {
    try {
      const accessKey = getAccessKeyFromUrl()

      // 1. 检查是否有accessKey
      if (!accessKey) {
        // errorMsg.value = '缺少accessKey参数'
        // setTimeout(() => {
        //   goToHome()
        // }, 2000)
        return
      }

      // 2. 检查accessKey是否变化,如果变化则清空旧数据
      const oldAccessKey = getAccessKey()
      if (oldAccessKey !== accessKey) {
        clearAuthData()
        clearAllData()
      }

      // 3. 保存accessKey
      setAccessKey(accessKey)

      // 4. 调用获取token接口
      const response: any = await activity_lottery_getToken({ accessKey })
      console.log('🏷️🏷️🏷️[  ] ====> response', response);

      let token: string | undefined
      let activity_lottery_id: number | undefined

      // 适配返回数据结构
      if (response.code === 200 && response.data) {
        // 标准结构: {code, message, data: {token, activity_lottery_id}}
        token = response.data.token
        activity_lottery_id = response.data.activity_lottery_id
      }
      else if (response.token) {
        // 直接返回结构: {token, valid_to, activity_lottery_id}
        token = response.token
        activity_lottery_id = response.activity_lottery_id
      }

      if (token && activity_lottery_id) {
        // 5. 保存token和activity_lottery_id
        setToken(token)
        setActivityLotteryId(activity_lottery_id)

        console.log('初始化成功', {
          token,
          activity_lottery_id,
        })

        // 6. 立即获取所有数据
        await initAllData(activity_lottery_id)
      }
      else {
        throw new Error(response.message || '获取token失败')
      }
    }
    catch (error: any) {
      console.error('初始化失败:', error)
      errorMsg.value = error.message || '初始化失败'
      // 出错时也跳转到首页
      setTimeout(() => {
        goToHome()
      }, 2000)
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    errorMsg,
    initApp,
  }
}
