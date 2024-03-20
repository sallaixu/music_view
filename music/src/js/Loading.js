import { createApp, reactive } from 'vue'

import myLoad from '@/components/Loading.vue'
import loadingJson from '@/assets/static/animations/loadding.json'
const msg = reactive({
  show: false,
  title: '加载中...',
  data: loadingJson
})

const $loading = createApp(myLoad, {msg}).mount(document.createElement('div'))
const load = {
  show({title,duration = null,data = null}) { // 控制显示loading的方法
    msg.show = true
    msg.title = title
    document.body.appendChild($loading.$el)
    if(duration) {
       let timeId = setTimeout(()=>{
            msg.show = false
        },duration)
    }
    if(data) {
        msg.data = data;
    }
  },
  hide() { // 控制loading隐藏的方法
    msg.show = false
  }
}
export  { load }
