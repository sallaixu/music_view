<template>

<div class="core-container" ref="scroll" >
  <div class="lyrics-container" >
    <div v-for="(line, index) in lyricLines" :key="index" :class="{ active: index === currentLine }" class="lyric-line">
      {{ line.txt }}
    </div>
  </div>
  <el-empty style="height: 100%;color: white;" v-if="lyricLines == null" description = "歌词走丢啦~🛸"/>
</div>
</template>

<script>
import {ref} from 'vue';
import Lyric from '../js/LyricUtil'
import BScroll from 'better-scroll'
var bs;
export default {
  name: 'LyricView',
  data() {
    return {
      lyric: null,
      lyricLines: null,
      currentLine: 0,
      bs: null,
      lastScrollY: 0
    }
  },
  methods: {
    addLyric(lyric) {
      try{
        if(this.lyric != null) {
          this.lyric.stop();
          this.lyric = null;
        }
        this.lyric = new Lyric(lyric, this.handleLyric)
        this.lyricLines = this.lyric.lines;
        if (bs == null) {
          this.$nextTick(() => {
          bs = new BScroll(this.$refs.scroll,{
          scrollY: true, // 开启纵向滚动
          click: true, // 开启点击事件
          momentum: false, // 关闭惯性滚动
          probeType: 3, // 实时监听滚动位置变化
        });
        })
        bs.refresh();
        }
        this.$nextTick(() => {
          console.log("refresh")
          bs.refresh();
          this.handleLyric({lineNum:0,txt:""});
        })
      }catch(error) {
        console.log(error)
      }
      
      
    },
    handleLyric({lineNum, txt}) {
      this.currentLine = lineNum
      var dom = this.$refs.scroll.children[0].children[lineNum];
      console.log(lineNum,dom);
      bs.scrollToElement(dom,50,true,true);
    },
    play() {
      if(this.lyric) {
        this.lyric.play();
      }
      
    },
    pause() {
      if(this.lyric) {
      this.lyric.togglePlay();
      }
    },
    stop() {
      if(this.lyric) {
      this.lyric.stop();
      }
    },

    handleMusicTimeUpdate(currentTime) {
      // 更新当前播放时间
      this.currentTime = currentTime
      // 歌词解析器根据当前播放时间进行滚动显示
      this.lyric.seek(currentTime * 1000)
    },

  },
  mounted() {
      
    }
}
</script>

<style lang="scss">

.core-container{
  height: 100% !important;
  overflow-y: auto;
  position: relative;
  
}

.core-container:hover::-webkit-scrollbar-thumb {
    background-color: #636363;
}

.core-container:hover::-webkit-scrollbar-track {
  background-color: #ffffff;
}

.lyrics-container {
  // height: 100%; /* 歌词容器的高度 */
  // overflow-y: hidden;
  // position: relative;
  line-height: 24px; /* 歌词行高度 */
  height: fit-content;
}

.lyric-line {
  text-align: center;
  transition: 1.0s scale; /* 添加过渡效果 */
  line-height: 2rem;
  letter-spacing: 3px;
  font-size: medium;
  color: black;
}

.lyric-line.active {
  font-weight: bold; /* 激活状态的歌词加粗显示 */
  color: #409eff;
  text-shadow: 3px 3px 3px rgba(32, 32, 32, 0.815);
  font-size: x-large;
}

.el-empty__description p{
  color: #e8e8e9  !important;
}

// .el-tabs__content{
//   height: 100%;
// }

</style>
