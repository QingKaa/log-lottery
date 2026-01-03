import request from '@/api/request'


/**
 * 获取奖品列表
 * @param params { activity_lottery_id : number}
 * @returns 
 */
export const get_prize_list = (params: any) => {
    return request({
        url: '/front/activity/lottery/prize/list',
        method: 'GET',
        params,
    })
}

/**
 * 新增奖品
 * @param data {
    "activity_lottery_id": 2,
    "name": "空调",
    "image": "https://example.com/lottery/banner_2025.jpg",
    "description": "格力空调",
    "is_all": 1,
    "sort":1,
    "total": 13,
    "level": 3,
    "each_lottery_limit": "1,2,10"
}
 * @returns 
 */
export const activity_lottery_prize_create = (data: any) => {
    return request({
        url: '/front/activity/lottery/prize/create',
        method: 'POST',
        data,
    })
}


/**
 * 编辑奖品
 * @param data {
 *  "id": 1,
    "activity_lottery_id": 2,
    "name": "空调",
    "image": "https://example.com/lottery/banner_2025.jpg",
    "description": "格力空调",
    "is_all": 1,
    "sort":1,
    "total": 13,
    "level": 3,
    "each_lottery_limit": "1,2,10"
}
 * @returns 
 */
export const activity_lottery_prize_update = (data: any) => {
    return request({
        url: `/front/activity/lottery/prize/update/${data.id}`,
        method: 'POST',
        data,
    })
}

/**
 * 编辑奖品已抽完
 * @param data 
 * @returns 
 */
export const activity_lottery_prize_setEnd = (id: any) => {
    return request({
        url: `/front/activity/lottery/prize/set-end/${id}`,
        method: 'POST',
        data: { is_end: 0 },
    })
}

/**
 * 编辑奖品全员可以抽取
 * @param id 
 * @param is_all 0 不可以 1 可以
 * @returns 
 */
export const activity_lottery_prize_setAll = (id: any, is_all: number) => {
    return request({
        url: `/front/activity/lottery/prize/set-all/${id}`,
        method: 'POST',
        data: { is_all: is_all },
    })
}

/**
 * 删除奖品
 * @param id 
 * @returns 
 */
export const activity_lottery_prize_delete = (id: any) => {
    return request({
        url: `/front/activity/lottery/prize/delete/${id}`,
        method: 'DELETE',
    })
}

/**
 * 获取活动抽奖Token
 * @param params { accessKey : string }
 * @returns 
 */
export const activity_lottery_getToken = (params: any) => {
    return request({
        url: '/front/activity/lottery/getToken',
        method: 'GET',
        params,
    })
}


/**
 * 抽奖用户导入模板
 * @returns 
 */
export const activity_lottery_user_downloadTemplate = () => {
    return request({
        url: '/front/activity/lottery/user/download-template',
        method: 'GET',
    })
}

/**
 * 中将用户移除
 * @param data {activity_lottery_id： number, lottery_code: string}
 * @returns 
 */
export const activity_lottery_user_removeWinner = (data: any) => {
    return request({
        url: `/front/activity/lottery/user/remove-winner`,
        method: 'POST',
        data,
    })
}

/**
 * 中奖用户导出
 * @param params { activity_lottery_id : number }
 * @returns 
 */
export const activity_lottery_user_exportWinners = (params: any) => {
    return request({
        url: `/front/activity/lottery/user/export-winners`,
        method: 'GET',
        params,
    })
}

/**
 * 中奖用户列表
 * @param params { page : number, limit : number, activity_lottery_id : number }
 * @returns 
 */
export const activity_lottery_user_winners_list = () => {
    return request({
        url: `/front/activity/lottery/user/winners`,
        method: 'GET',
    })
}

/**
 * 取消抽奖结果
 * @param data {
    "activity_lottery_id":1,
    "prize_id":2,
    "lottery_codes":[
        "1B0632BD"
    ]
}
 * @returns
 */
export const activity_lottery_cancelDraw = (data: any) => {
    return request({
        url: `/front/activity/lottery/cancel-draw`,
        method: 'POST',
        data,
    })
}

/**
 * 获取人员列表
 * @param params { activity_lottery_id : number, is_winner: number, is_sign: number }
 * is_winner 筛选中奖状态 0未中奖 1中奖 不传则查看全部
 * is_sign 筛选签到状态 0未签到 1已签到 不传则查看全部
 * @returns
 */
export const activity_lottery_user_list = (params: any) => {
    return request({
        url: '/front/activity/lottery/user/list',
        method: 'GET',
        params,
    })
}

/**
 * 导入人员数据
 * @param data { activity_lottery_id : number, file : File }
 * @returns
 */
export const activity_lottery_user_import = (data: any) => {
    return request({
        url: '/front/activity/lottery/user/import',
        method: 'POST',
        data,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

/**
 * 删除人员
 * @param data { activity_lottery_id : number, lottery_codes : string[] }
 * @returns
 */
export const activity_lottery_user_delete = (data: any) => {
    return request({
        url: '/front/activity/lottery/user/delete',
        method: 'DELETE',
        data,
    })
}

/**
 * 重置人员数据(清空所有人员)
 * @param params { activity_lottery_id : number }
 * @returns
 */
export const activity_lottery_user_reset = (params: any) => {
    return request({
        url: '/front/activity/lottery/user/reset',
        method: 'POST',
        data: params,
    })
}

/**
 * 导出人员数据
 * @param params { activity_lottery_id : number }
 * @returns
 */
export const activity_lottery_user_export = (params: any) => {
    return request({
        url: '/front/activity/lottery/user/export',
        method: 'GET',
        params,
        responseType: 'blob',
    })
}