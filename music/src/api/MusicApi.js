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

export function getLikeSong(page = 1,size = 200) {
  return Service({
    url: `_api/music/like/list?page=${page}&size=${size}`,
    method: 'get'
  })
}

export function removeLikeMusic(musicID) {
  return Service({
    url: `_api/music/like/remove`,
    data: musicID,
    method: 'post'
  })
}

export function addLikeMusic(data) {
  return Service({
    url: `_api/music/like/add`,
    data: data,
    method: 'post'
  })
}
