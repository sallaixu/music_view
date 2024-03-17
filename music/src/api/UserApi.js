import {Service, DefaultService} from '../js/Service'
export function getUserInfo() {
  return Service({
    url: `_api/user/info`,
    method: 'get'
  })
}

