import axios from 'axios'
const ConfigBaseURL = import.meta.env.VITE_API_BASE_HOST //默认路径，这里也可以使用env来判断环境
let loadingInstance = null //这里是loading
//使用create方法创建axios实例
export const Service = axios.create({
  timeout: 7000, // 请求超时时间
  baseURL: ConfigBaseURL,
  method: 'post',
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

export const DefaultService = axios.create({
  timeout: 7000, // 请求超时时间
  baseURL: ConfigBaseURL,
  method: 'post',
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 添加请求拦截器
Service.interceptors.request.use(config => {
  var token = localStorage.getItem('token')
  if(token) {
    config.headers.token = token;
  }
  loadingInstance = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.2)',
  })
  return config
})
// 添加响应拦截器
Service.interceptors.response.use(response => {
  loadingInstance.close()
  // console.log(response)
  return response.data
}, error => {
  console.log('TCL: error 1', error)
  const msg = error.Message !== undefined ? error.Message : ''
  ElMessage.error('网络错误' + msg);
  loadingInstance.close()
  return Promise.reject(error)
})
