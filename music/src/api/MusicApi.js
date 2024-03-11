import {Service, DefaultService} from '../js/Service'
export function searchMusic(type = 'BABY_MUSIC',keyword,size = 10) {
  return Service({
    url: `_api/music/search/${type}/${keyword}/${size}`,
    method: 'get'
  })
}

export function getMusicDetail(musicID,type = 'BABY_MUSIC') {
  return Service({
    url: `_api/music/detail/${type}/${musicID}`,
    method: 'get'
  })
}

export function downLoad(url) {
  return DefaultService({
    url: `_api/music/download`,
    data: url,
    method: 'post'
  })
}
