
import request from '@/api/request'

/**
 * 获取小程序码
 * @returns 
 */
export const wx_img = (activity_lottery_id: any) => {
    return request({
        url: '/front/wx/img',
        method: 'GET',
        params: { path: `pageslottery/signIn/index?id=${activity_lottery_id}` },
    })
}