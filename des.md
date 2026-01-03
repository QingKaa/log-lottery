# 流程说明

## 1.初始化
页面打开的时候获取地址栏中的 accessKey 参数，使用 accessKey 调用 activity_lottery_getToken 获取token，并保存到storage中，其余接口都需要在请求头中带上token： authorization: Bearer + token; 

activity_lottery_getToken 接口会返回结构如下：
```
{
    "code": 200,
    "message": "ok",
    "data": {
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJodHRwOi8vYXBwLnRlc3QubWVuc2FkaW5uZXIuY29tL2Zyb250L3YyL2F1dGgvbG9naW4iLCJpYXQiOjE3NjcyNTY2NTIsImV4cCI6MTc2ODU1MjY1MiwibmJmIjoxNzY3MjU2NjUyLCJqdGkiOiJkazlQT0FZV0J6RzNlY2xvIiwic3ViIjoiMjYwIiwicHJ2IjoiZjZiNzE1ND",
        "valid_to": "2026-01-02 11:11:30",
        "activity_lottery_id": 2
    }
}
```
需要将token 以及 activity_lottery_id 保存起来（很多接口都涉及到 activity_lottery_id ）

注意:
1. 当没有accessKey的时候，弹窗提示缺少accessKey参数，并跳转到首页。
2. 拿到 accessKey之后，需要清空之前的内容,包括 token ，抽奖 人员列表， 中奖人员，奖品配置


## 根据 activity_lottery_id 获取信息
需要调整项目中所有的信息都要从api中获取，不要使用本地数据，api已经配置在api/activity/index.ts 中。           
需要处理： 人员列表， 中奖人员，奖品配置，编辑奖品，新增奖品，下载模板，删除人员（通过接口API获取,api配置在 api/activity/index.ts 中）。
1. 人员列表： 删除全部， 下载模板， 导入数据，重置数据，导出结构，添加
2. 中奖人员：中奖人员列表
3. 奖品配置：添加、删除，修改