<template>
  <div class="lyrics-container">
    <div v-for="(line, index) in lyricLines" :key="index" :class="{ active: index === 3 }" class="lyric-line">
      {{ line.txt }}
    </div>
  </div>
</template>

<script>
import Lyric from '../js/LyricUtil'
export default {
  name: 'LyricView',
  data() {
    return {
      lyric: {
        lines:[]
      },
      lyricLines: [],
      currentLine: 0
    }
  },
  methods: {
    addLyric(lyric) {
      this.lyric = new Lyric(lyric, this.handleLyric)
    },
    handleLyric({lineNum, txt}) {
      this.currentLine = lineNum
      this.lyricLines = this.lyric.lines.slice(Math.max(lineNum - 3, 0), Math.max(lineNum + 3,7))
    },
    handleMusicTimeUpdate(currentTime) {
      // 更新当前播放时间
      this.currentTime = currentTime
      // 歌词解析器根据当前播放时间进行滚动显示
      this.lyric.seek(currentTime * 1000)
    }
  }
}
</script>

<style lang="scss">

.lyrics-container {
  height: 100%; /* 歌词容器的高度 */
  overflow-y: scroll;
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
