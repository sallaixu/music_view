<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { searchMusic, getMusicDetail } from '@/api/MusicApi'
import { sendRequest } from '@/api/BaseRequest'
import Howler from 'howler';

//======================变量定义区============================
//歌词
var lyric = ref(null)
//音乐搜索结果
const searchListStatus = ref(false)
//定时器索引
let index = 0;
var type = ref("i-ep-add-location");
var keyWord = ref("");
var musicSearchData = ref(null);
const sound = ref(null);
const songUrl = ref(''); // 用于存储歌曲URL的响应式引用
var musicInfo = ref(null);
var playProcessTimer;
//音乐播放进度
var music_process = ref(0);
//当前歌曲时长
var duration = ref(100);
var playing = ref(false);
//==================生命周期函数区============================
onMounted(() => {
  console.log(`the component is now mounted.`)
  // 延迟使用，因为还没有返回跟挂载
  nextTick(() => {
    lyric.value.addLyric(lrc)
  })
})

onBeforeUnmount(() => {
  // 在组件销毁之前清除定时器
  clearTimeout();
})

function clearTimeout() {
  if (playProcessTimer) {
    clearInterval(playProcessTimer);
    playProcessTimer = null;
  }
}

//========================定时器区============================
// setInterval(() => {
//   console.log("timer", index)
//   lyric.value.handleMusicTimeUpdate(index);
//   index += 3;
//   // lyric.value.scroll(index);
// }, 1000);
//========================组件接受参数============================
defineProps({
  msg: {
    type: String,
    required: true
  },
  num: {
    type: Number,
    required: false
  }
})
//======================自定义方法区================================
function callLrc() {
  searchMusic("BABY_MUSIC", keyWord).then((res) => {
    console.log(res);
  })
}
/**
 * 搜索音乐
 */
function search() {
  if (keyWord.value == "") {
    ElMessage({
      showClose: true,
      message: '输入内容为空',
      type: 'error',
    })
    return;
  }
  searchMusic("BABY_MUSIC", keyWord.value).then((res) => {
    console.log(res);
    musicSearchData.value = res.data;
    searchListStatus.value = true;
  })
}

// 设置歌曲的URL并播放
function setSong(url) {
  if (sound.value) {
    sound.value.unload(); // 卸载当前歌曲（如果有的话）
  }
  sound.value = new Howl({
    src: [url],
    html5: true,
    loop: true,
    onplay: () => {
      console.log('歌曲开始播放');
      musicPlayListen();
      lyric.value.pause();
    },
    onpause: () => {
      console.log('歌曲已暂停');
      lyric.value.pause();
    },
    onstop: () => {
      console.log('歌曲已停止');
      lyric.value.stop();
    },
    onend: () => {
      console.log('歌曲播放结束');
      lyric.value.stop();
      playing.value = false
    },
    onload: () => {
      console.log('歌曲已加载');
      lyric.value.stop();
      // 可以在这里获取歌曲信息，如时长
      let time = sound.value.duration(); // 秒
      duration.value = time;
      console.log('歌曲时长:', time);
    },
    onseek: (id) => {
      console.log("onseek")
    },
    onprogress: (event) => {
      // 处理播放进度
      const progress = (event.played / event.total) * 100;
      console.log('播放进度:', progress.toFixed(2), '%');
    }
  });
  console.log("准备播放")
  sound.value.play(); // 加载完成后自动播放
}

function musicPlayListen() {
  if (playProcessTimer == null) {
    playProcessTimer = setInterval(() => {
      let value = Math.floor(sound.value.seek());
      // lyric.value.handleMusicTimeUpdate(value);
      console.log(value);
      music_process.value = value;
    }, 1000);
  }
}

function handlerMusic(data) {
  console.log("play info", data.url);
   
  getMusicDetail(data.id).then((res) => {
    musicInfo.value = res.data; 
    setSong(res.data.url);
    lyric.value.addLyric(res.data.lyric);
  })

}

//音乐控制
function playPause() {
  if(sound.value.playing()) {
    sound.value.pause();
  } else {
    sound.value.play();
  }
}

function playPre() {
  sound.value.playPre();
}

function playNext() {
  sound.value.playNext();
}

function musicSeek() {
  sound.value.seek(music_process.value);
}


</script>




<template>
  <div class="common-layout">
    <!-- 搜索结果抽屉 -->
    <el-drawer v-model="searchListStatus" title="音乐搜索结果" size="40%" :with-header="false">
      <el-table :data="musicSearchData.musicinfo" stripe style="width: 100%">
        <el-table-column label="歌曲" prop="title" />
        <el-table-column label="歌手" prop="artist" />
        <el-table-column align="right">
          <template #header>
            <el-input size="small" placeholder="Type to search" />
          </template>

          <template #default="scope">
            <div class="musicOperator">
              <i-ep-Headset class="music_item_icon" @click="handlerMusic(scope.row)"></i-ep-Headset>
              <i-flat-color-icons:like class="music_item_icon"></i-flat-color-icons:like>
              <i-ep-CirclePlus class="music_item_icon"></i-ep-CirclePlus>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
    <el-container style="height: 100%;">
      <el-header height="100px">
        <el-row :gutter="5" justify="center">
          <el-col :xs="14" :sm="10" :md="8" :lg="8" :xl="8">
            <div class="input-div">
              <el-input v-model="keyWord" class="input-class" @keyup.enter="search" size="large" placeholder="输入关键词">

                <template #append>
                  <i-ep-search @click="search" class="search" />
                </template>
              </el-input>
            </div>
          </el-col>
        </el-row>
      </el-header>


      <el-main>
        <el-row :gutter="5" justify="center" style="height: 100%;">
          <el-col :xs="14" :sm="10" :md="8" :lg="8" :xl="8" style="height: 100%; overflow: hidden;">
            <lyric-view ref="lyric" style="height: 100%;"></lyric-view>
          </el-col>
        </el-row>
      </el-main>


      <el-footer height="100px">
        <!-- 播放进度条 -->
        <el-row class="flex-center">
          <el-col :xs="20" :sm="18" :md="12" :lg="12" :xl="12">
            <span class="demonstration">{{ musicInfo != null ? musicInfo.title:"" }}</span>
            <span class="demonstration">{{ musicInfo != null ? musicInfo.artist:"" }}</span>
            <span style="display: inline">{{ music_process }}</span>
            <el-slider v-model="music_process" :max="duration" @change="musicSeek"></el-slider>
          </el-col>
        </el-row>
        <el-row :gutter="5" justify="center">
          <el-col :xs="20" :sm="18" :md="12" :lg="12" :xl="12" class="flex-center">
            <el-button @click="playPre" class="music_operator" type="primary" circle>
              <template #icon>
                <i-ant-design-left-outlined />
              </template>
            </el-button>
            <el-button @click="playPause" class="music_operator" style="height: 70px; width: 70px; font-size: 40px"
              type="primary" size="medium" circle>

              <template #icon>
                <i-bi-play-fill />
              </template>
            </el-button>
            <el-button @click="playNext" class="music_operator" type="primary" circle>

              <template #icon>
                <i-ant-design-right-outlined />
              </template>
            </el-button>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>
  </div>
</template>

<style lang="scss">
.music_item_icon {
  cursor: pointer;
}

.music_item_icon:hover {
  transform: scale(1.1);
  /* 按钮点击时稍微缩小 */
}

.common-layout {
  height: 100%;
}

.input-div {
  width: 100%;
  border-radius: 95px;
  background-color: #ffffff;
  border-radius: 95px;
}

.flex-center {
  display: flex !important;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.input-class {

  border: #afafaf solid 1px;
  border-radius: 95px;

  .el-input-group__prepend {
    border-radius: 95px;
    border: 0;
    box-shadow: 0 0 0 0px;
  }

  .el-input__wrapper {
    border-radius: 95px;
    border: 0;
    box-shadow: 0 0 0 0px;
  }

  .el-input-group__append {
    border-radius: 95px;
    border: 0;
    box-shadow: 0 0 0 0px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    /* 添加过渡效果 */
  }

  .el-input-group__append:hover {
    background-color: rgb(75, 75, 75);
  }

  .el-input-group__append:active {
    transform: scale(0.90);
    /* 按钮点击时稍微缩小 */
  }


}

.musicOperator {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;

}
</style>
