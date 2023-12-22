// 引入axios
import axios from 'axios'
// 创建的axios的实列 instance
const request = axios.create({
  baseURL: 'http://115.231.76.60:8827/map', // 基准地址  可直接配置路径,也可代理路径(以实际项目为准)
  timeout: 10000 // 超时时间
})
// 请求拦截
// 声明变量接收logding
// let loadingInstance
request.interceptors.request.use(
  (config) => {
    // 设置请求头
    let token = localStorage.getItem('token')
    config.headers.Authorization = token

    // 返回请求头
    return config
  },
  (err) => {
    // 请求失败返回失败信息
    return Promise.reject(err)
  }
)

// 响应拦截
request.interceptors.response.use(
  (res) => {
    // 响应成功则关闭loading加载
    //返回响应数据
    return res.data
  },
  (err) => {
    setTimeout(() => {}, 1000)
    // 响应失败返回失败信息
    return Promise.reject(err)
  }
)
// 导出实例
export default request
