<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { searchMusic, getMusicDetail } from "@/api/MusicApi";
import { sendRequest } from "@/api/BaseRequest";
import Howler from "howler";
import SearchPage from "./SearchPage.vue";
//======================变量定义区============================
//歌词
var lyric = ref(null);
//音乐搜索结果
const searchListStatus = ref(false);
//定时器索引
let index = 0;
var type = ref("i-ep-add-location");
var keyWord = ref("");
var musicSearchData = ref(null);
const sound = ref(null);
const songUrl = ref(""); // 用于存储歌曲URL的响应式引用
var musicInfo = ref(null);
var playProcessTimer;
//音乐播放进度
var music_process = ref(0);
//当前歌曲时长
var duration = ref(100);
var playing = ref(false);
var selectTab = ref("lyric");
var musicSources = ref(["BABY_MUSIC", "SLIDER_KZ","NET_EASY"]);
var selectMusicSource = ref(musicSources.value[0]);
var volumn = ref(80);
var playList = ref([]);
var storage = window.localStorage;
var songIndex = ref(0);
//==================生命周期函数区============================
onMounted(() => {
  init();
  console.log(`the component is now mounted.`);
  // 延迟使用，因为还没有返回跟挂载
  nextTick(() => {
    lyric.value.addLyric(lrc);
  });
});

function init() {
  let playData = storage.getItem('playList');
  if(playData) {
    playList.value = JSON.parse(playData)
  }
}


onBeforeUnmount(() => {
  // 在组件销毁之前清除定时器
  clearTimeout();
});

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
    required: true,
  },
  num: {
    type: Number,
    required: false,
  },
});
//======================自定义方法区================================
function callLrc() {
  searchMusic("BABY_MUSIC", keyWord).then((res) => {
    console.log(res);
  });
}
/**
 * 搜索音乐
 */
function search() {
  if (keyWord.value == "") {
    ElMessage({
      showClose: true,
      message: "输入内容为空",
      type: "error",
    });
    return;
  }
  searchMusic(selectMusicSource.value, keyWord.value, 50).then((res) => {
    console.log(res);
    musicSearchData.value = res.data;
    // searchLstStatus.value = true;\
    selectTab.value = "searchResult";
  });
}

// 设置歌曲的URL并播放
function setSong(url) {
  if (sound.value) {
    sound.value.unload(); // 卸载当前歌曲（如果有的话）
  }
  sound.value = new Howl({
    src: [url],
    html5: true,
    // loop: true,
    volume: (volumn.value / 100).toFixed(2),
    onplay: () => {
      console.log("歌曲开始播放");
      musicPlayListen();
      lyric.value.pause();
      playing.value = true;
    },
    onpause: () => {
      console.log("歌曲已暂停");
      lyric.value.pause();
      playing.value = false;
    },
    onstop: () => {
      console.log("歌曲已停止");
      lyric.value.stop();
      playing.value = false;
    },
    onend: () => {
      console.log("歌曲播放结束");
      lyric.value.stop();
      playing.value = false;
      playNext();
    },
    onload: () => {
      console.log("歌曲已加载");
      lyric.value.stop();
      // 可以在这里获取歌曲信息，如时长
      let time = sound.value.duration(); // 秒
      duration.value = time;
      console.log("歌曲时长:", time);
    },
    onseek: (id) => {
      console.log("onseek");
    },
  });
  console.log("准备播放");
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
/**
 * 添加播放列表
 */
function addPlayList(data) {
  playList.value.push(data);
  saveLocalStorge();
}

function handlerMusic(data) {
  console.log("play info", data.url);
  switch (data.sourceType) {
    case null:
    case "SLIDER_KZ":
      setSong(data.url);
      musicInfo.value = data;
      lyric.value.addLyric(data.lyric);
      break;
    case "BABY_MUSIC":
      getMusicDetail(data.id).then((res) => {
        musicInfo.value = res.data;
        setSong(res.data.url);
        lyric.value.addLyric(res.data.lyric);
      });
      break;
    default:
      ElMessage.error("歌曲源不支持:" + data.sourceType);
  }
  ElMessage({
    message: "正在加载:" + data.title + " " + data.artist,
    type: 'message',
  })
}


function saveLocalStorge() {
  //保存播放列表
  storage.removeItem('playList');
  storage.setItem('playList',JSON.stringify(playList.value));
}

//音乐控制
function playPause() {
  if(!sound.value && playList.value.length > 0) {
    handlerMusic(playList.value[0]);
  }
  if(sound.value) {
    if (sound.value.playing()) {
      sound.value.pause();
    } else {
      sound.value.play();  
    }
  }
  
}

function playPre() {
  if(playList.value) {
  songIndex.value = (songIndex.value - 1) >= 0 ?
  songIndex.value - 1 : playList.value.length - 1;
  handlerMusic(playList.value[songIndex.value]);
  }
}

function playNext() {
  if(playList.value) {
  songIndex.value = (songIndex.value + 1) < playList.value.length ?
  songIndex.value + 1 : 0
  handlerMusic(playList.value[songIndex.value]);
  }
}

function musicSeek() {
  sound.value.seek(music_process.value);
  lyric.value.handleMusicTimeUpdate(music_process.value);
}

function volumnChange() {
 let v = (volumn.value / 100).toFixed(2)
 console.log("volume",v);
 sound.value.volume(v);
}
</script>




<template>
  <div class="common-layout">
    <!-- 搜索结果抽屉 -->
    <el-drawer
      v-model="searchListStatus"
      title="音乐搜索结果"
      size="40%"
      :with-header="false"
    >
    </el-drawer>
    <el-container style="height: 100%">
      <el-header height="100px">
        <el-row :gutter="5" justify="center">
          <el-col :xs="20" :sm="14" :md="10" :lg="8" :xl="8">
            <div class="flex-center">
              <div class="input-div">
                <el-input
                  v-model="keyWord"
                  class="input-class"
                  @keyup.enter="search"
                  size="large"
                  placeholder="输入关键词"
                >
                  <template #append>
                    <i-ep-search @click="search" class="search" />
                  </template>
                </el-input>
              </div>
              <el-select
                v-model="selectMusicSource"
                size="small"
                placeholder="Select"
                style="width: 100px"
              >
                <el-option
                  v-for="item in musicSources"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </div>
          </el-col>
        </el-row>
      </el-header>

      <el-main>
        <el-row :gutter="5" justify="center" style="height: 100%">
          <el-col
            :xs="24"
            :sm="20"
            :md="20"
            :lg="18"
            :xl="18"
            style="height: 100%; overflow: hidden"
          >
            <el-tabs
              v-model="selectTab"
              tab-position="top"
              type="card"
              style="height: 100%"
            >
              <el-tab-pane name="musciTable" label="播放列表">
                <el-table
                  :data="playList"
                  stripe
                  style="width: 100%"
                >
                  <el-table-column
                    width="auto"
                    min-width="10%"
                    label="序号"
                    type="index"
                  />
                  <el-table-column
                    width="auto"
                    min-width="30%"
                    label="歌曲"
                    prop="title"
                  />
                  <el-table-column
                    width="auto"
                    min-width="30%"
                    label="歌手"
                    prop="artist"
                  />
                  <el-table-column width="auto" min-width="30%" align="right">
                    <template #header>
                      <el-input size="small" placeholder="Type to search" />
                    </template>
                    <template #default="scope">
                      <div class="musicOperator">
                        <i-ep-Headset
                          class="music_item_icon"
                          @click="handlerMusic(scope.row)"
                        ></i-ep-Headset>
                        <i-flat-color-icons:like
                          class="music_item_icon"
                        ></i-flat-color-icons:like>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane name="lyric" label="歌词" style="height: 100%">
                <lyric-view ref="lyric" style="height: 100%"></lyric-view>
              </el-tab-pane>
              <el-tab-pane name="searchResult" label="结果">
                <el-table
                  v-if="musicSearchData"
                  :data="musicSearchData.musicinfo"
                  stripe
                  style="width: 100%"
                >
                  <el-table-column
                    width="auto"
                    min-width="10%"
                    label="序号"
                    type="index"
                  />
                  <el-table-column
                    width="auto"
                    min-width="30%"
                    label="歌曲"
                    prop="title"
                  />
                  <el-table-column
                    width="auto"
                    min-width="30%"
                    label="歌手"
                    prop="artist"
                  />
                  <el-table-column width="auto" min-width="30%" align="right">
                    <template #header>
                      <el-input size="small" placeholder="Type to search" />
                    </template>
                    <template #default="scope">
                      <div class="musicOperator">
                        <i-ep-Headset
                          class="music_item_icon"
                          @click="handlerMusic(scope.row)"
                        ></i-ep-Headset>
                        <i-flat-color-icons:like
                          class="music_item_icon"
                        ></i-flat-color-icons:like>
                        <i-ep-CirclePlus
                          class="music_item_icon"
                          @click="addPlayList(scope.row)"
                        ></i-ep-CirclePlus>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-main>

      <el-footer height="100px">
        <!-- 播放进度条 -->
        <el-row class="flex-center">
          <el-col :xs="24" :sm="20" :md="20" :lg="18" :xl="18">
            <el-tag
              type="primary"
              style="font-size: larger"
              size="large"
              v-if="musicInfo != null && musicInfo.title != null"
              >{{ musicInfo.title }}</el-tag
            >
            <el-tag
              style="margin-left: 10px"
              type="primary"
              size="large"
              v-if="musicInfo != null && musicInfo.artist != null"
              >{{ musicInfo.artist }}</el-tag
            >
            <el-slider
              v-model="music_process"
              :max="duration"
              @change="musicSeek"
            ></el-slider>
          </el-col>
        </el-row>
        <el-row :gutter="5" justify="center">
          <el-col
            :xs="20"
            :sm="18"
            :md="12"
            :lg="12"
            :xl="12"
            class="flex-center"
          >
            <el-button
              @click="playPre"
              class="music_operator"
              type="primary"
              circle
            >
              <template #icon>
                <i-ant-design-left-outlined />
              </template>
            </el-button>
            <el-button
              @click="playPause"
              class="music_operator"
              style="height: 70px; width: 70px; font-size: 40px"
              type="primary"
              size="medium"
              circle
            >
              <template #icon>
                <i-bi-play-fill v-if="!playing" />
                <i-ant-design-pause-outlined v-else />
              </template>
            </el-button>
            <el-button
              @click="playNext"
              class="music_operator"
              type="primary"
              circle
            >
              <template #icon>
                <i-ant-design-right-outlined />
              </template>
            </el-button>

            <div class="volumn">
              <i-uil-volume></i-uil-volume>
              <el-slider @change="volumnChange" :min=0 :max=100 :step=1 v-model="volumn" style="max-width:200px"  size="small" />
            </div>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>
  </div>
</template>

<style lang="less">

.music_item_icon 
{
  cursor: pointer;
}

.music_item_icon:hover {
  transform: scale(1.1);
  /* 按钮点击时稍微缩小 */
}
.el-tabs {
  .el-tabs__content {
    .el-tab-pane {
      overflow: auto;
      height: 100%;
    }
  }
}
.volumn{
  position: absolute;
  right: 10px;
  width: 200px;
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
    transform: scale(0.9);
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


//歌曲搜索结果样式修改
tr{
  background-color:hsla(0, 0%, 0%, 0) !important
}
td{
  background-color:hsla(0, 0%, 0%, 0) !important
}
.el-table{
  background-color:hsla(0, 0%, 0%, 0) !important
}
.el-table th.el-table__cell {
  background-color:hsla(0, 0%, 0%, 0) !important
}
.el-table__row--striped {
  background-color: rgba(75, 75, 75, 0.5) !important
}

</style>
