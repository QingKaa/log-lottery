const TOKEN_KEY = 'userToken'
const ACTIVITY_LOTTERY_ID_KEY = 'activityLotteryId'
const ACCESS_KEY_KEY = 'accessKey'

/**
 * 获取token
 */
export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置token
 */
export function setToken(token: string) {
  return window.localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除token
 */
export function removeToken() {
  return window.localStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取activity_lottery_id
 */
export function getActivityLotteryId() {
  const id = window.localStorage.getItem(ACTIVITY_LOTTERY_ID_KEY)
  return id ? Number(id) : null
}

/**
 * 设置activity_lottery_id
 */
export function setActivityLotteryId(id: number) {
  return window.localStorage.setItem(ACTIVITY_LOTTERY_ID_KEY, String(id))
}

/**
 * 移除activity_lottery_id
 */
export function removeActivityLotteryId() {
  return window.localStorage.removeItem(ACTIVITY_LOTTERY_ID_KEY)
}

/**
 * 获取accessKey
 */
export function getAccessKey() {
  return window.localStorage.getItem(ACCESS_KEY_KEY)
}

/**
 * 设置accessKey
 */
export function setAccessKey(accessKey: string) {
  return window.localStorage.setItem(ACCESS_KEY_KEY, accessKey)
}

/**
 * 移除accessKey
 */
export function removeAccessKey() {
  return window.localStorage.removeItem(ACCESS_KEY_KEY)
}

/**
 * 清空所有认证相关数据
 */
export function clearAuthData() {
  removeToken()
  removeActivityLotteryId()
  removeAccessKey()
}
