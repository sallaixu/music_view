import {Service} from '../js/Service'
const baseURL = ""
export function sendRequest(url,data,type = "get") {
  return Service({
    method: type,
    url:"",
    data: data,
    jsonp: true,
    baseURL: url,
    
  })
}
