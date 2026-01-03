import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { getToken } from '@/utils/auth'

class Request {
  private instance: AxiosInstance

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create({
      baseURL: '/api',
      timeout: 10000,
      ...config,
    })

    // 添加请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 在发送请求之前做些什么
        // console.log('请求拦截器被触发')

        // 添加token到请求头
        const token = getToken()
        if (token) {
          config.headers.authorization = `Bearer ${token}`
        }

        return config
      },
      (error: any) => {
        // 对请求错误做些什么
        console.error('请求拦截器发生错误：', error)

        return Promise.reject(error)
      },
    )

    // 添加响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 对响应数据做些什么
        // console.log('响应拦截器被触发', response.data)
        const responseData = response.data

        return responseData
      },
      (error: any) => {
        // 对响应错误做些什么
        // console.error('响应拦截器发生错误：', error)
        const { response } = error
        return Promise.reject(response?.data || error)
      },
    )
  }

  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.request(config)

    return response
  }
}

// 函数
function request<T>(config: AxiosRequestConfig): Promise<T> {
  const instance = new Request(config)

  return instance.request(config)
}

export default request
