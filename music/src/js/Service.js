import axios from 'axios'
import loadingJson from '@/assets/static/animations/loading2.json'
import { load } from '@/js/Loading.js';
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
  load.show({
    title: "处理中,请稍后",
    data: loadingJson
  })
  return config
})
// 添加响应拦截器
Service.interceptors.response.use(response => {
  // loadingInstance.close()
  // console.log(response)
  load.hide();
  if(response.data.code == 200) { 
    return response.data
  }
  ElMessage.error(response.data.msg);
  if(response.data.code == 201) {
    // token异常
    localStorage.removeItem("token");
    window.location.reload();
  }
}, error => {
  console.log('TCL: error 1', error)
  const msg = error.Message !== undefined ? error.Message : ''
  ElMessage.error('网络错误' + msg);
  load.hide();
  return Promise.reject(error)
})
