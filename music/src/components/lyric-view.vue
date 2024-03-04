<template>

<div class="core-container" >
  <div class="scroll-wrapper" ref="scroll">
  <div class="lyrics-container" >
    <div v-for="(line, index) in lyric.lines" :key="index" :class="{ active: index === 3 }" class="lyric-line">
      {{ line.txt }}
    </div>
  </div>
  </div>
</div>
</template>

<script>
import {ref} from 'vue';
import Lyric from '../js/LyricUtil'
import BScroll from '@better-scroll/core'
// var scroll = ref(null);
// var bs = new BScroll(scroll.value);

export default {
  name: 'LyricView',
  data() {
    return {
      lyric: {
        lines:[]
      },
      lyricLines: [],
      currentLine: 0,
      bs: null,
      lastScrollY: 0
    }
  },
  methods: {
    addLyric(lyric) {
      this.lyric = new Lyric(lyric, this.handleLyric)
    },
    handleLyric({lineNum, txt}) {
      this.currentLine = lineNum
      this.lyricLines = this.lyric.lines.slice(Math.max(lineNum - 3, 0), Math.max(lineNum + 3,7))
      this.bs.scrollToElement(this.lyric.lines[lineNum],0,true,true);
    },
    handleMusicTimeUpdate(currentTime) {
      // 更新当前播放时间
      this.currentTime = currentTime
      // 歌词解析器根据当前播放时间进行滚动显示
      this.lyric.seek(currentTime * 1000)
    },
    
    // scroll(x) {
    //   console.log("x：",x)
    //   if(this.bs == null) {
    //     console.log("is null")
    //     this.bs = new BScroll(this.$refs.scroll,{
    //       scrollY: true, // 开启纵向滚动
    //       click: true, // 开启点击事件
    //       momentum: false, // 关闭惯性滚动
    //       probeType: 3, // 实时监听滚动位置变化
    //     });
    //     this.bs.on('scroll', (pos) => {
    //     this.lastScrollY = pos.y; // 保存当前滚动位置
    //     // 在这里可以添加其他逻辑，比如更新 UI 等
    //   });
    //   }
    //   this.bs.scrollTo(0,x,0);
    // }
  },
  mounted() {
      this.$nextTick(() => {
        this.bs = new BScroll(this.$refs.scroll,{
          scrollY: true, // 开启纵向滚动
          click: true, // 开启点击事件
          momentum: false, // 关闭惯性滚动
          probeType: 3, // 实时监听滚动位置变化
        });
      })
    }
}
</script>

<style lang="scss">

.lyrics-container {
  height: 100%; /* 歌词容器的高度 */
  // overflow-y: hidden;
  position: relative;
  line-height: 24px; /* 歌词行高度 */
}

.lyric-line {
  text-align: center;
  transition: 1.0s scale; /* 添加过渡效果 */
  line-height: 2rem;
  letter-spacing: 3px;
  font-size: medium;
}

.lyric-line.active {
  font-weight: bold; /* 激活状态的歌词加粗显示 */
  color: rgb(0, 0, 0);
  font-size: x-large;
}

</style>
