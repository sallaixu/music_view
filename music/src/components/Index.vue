<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance} from "vue";
import { searchMusic, getMusicDetail ,getLikeSong, removeLikeMusic,addLikeMusic} from "@/api/MusicApi";
import { sendRequest } from "@/api/BaseRequest";
import { getUserInfo } from "@/api/UserApi";
import Howler from "howler";
import SearchPage from "./SearchPage.vue";
import qrcode from 'qrcode';
import loadingJson from '@/assets/static/animations/loading2.json'
import { load } from '@/js/Loading.js';
// import axios from 'axios'
//======================变量定义区============================
//歌词
// const loadingJson = ref(loadingJson);
// load.show({title:"获取数据中",duration:10000,data:loadingJson});
// load.hide();
const { proxy } = getCurrentInstance();
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
var musicInfo = ref({});
var playProcessTimer;
//音乐播放进度
var music_process = ref(0);
//当前歌曲时长
var duration = ref(100);
var playing = ref(false);
var selectTab = ref("lyric");
var musicSources = ref([{
  value: "BABY_MUSIC",
  label: "下歌宝"
}, {
  value: "SLIDER_KZ",
  label: "SLIDER.KZ"
}, {
  value: "NET_EASY",
  label: "网易云"
}, {
  value: "HIFI_NI",
  label: "HIFINI"
}

]);
var selectMusicSource = ref(musicSources.value[3].value);
var volumn = ref(85);
var playList = ref([]);
var storage = window.localStorage;
var songIndex = ref(0);
var loadingMusic = ref(false);
var qrImgUrl = ref(null);
var userInfo = ref({});
var qrShow = ref(false);

var cloudLikeSong = ref([]);
var deleteDialog = ref(false);
var removeLikeSongId = ref(null);
//random,order,loop
var playMode = ref("order")


//==================生命周期函数区============================
onMounted(() => {
  init();
  console.log(`the component is now mounted.`);
  // 延迟使用，因为还没有返回跟挂载
  proxy.$socketIo.on("qrUrl", (data) => {
    console.log(data);
    qrcode.toDataURL(data.data.qrCodeReturnUrl, (err, url) => {
      if (err) {
        console.error(err);
      } else {
        qrImgUrl.value = url;
        qrShow.value = true;
      }
    });
  });

  proxy.$socketIo.on("token", (data) => {
    ElNotification({
    title: '通知',
    message: '登录成功',
    type: 'success',
    duration: 2000
  })
    console.log("token", data);
    localStorage.setItem('token', data);
    qrShow.value = false;
    updateUserData();
  });
});

function init() {
  let playData = storage.getItem('playList');
  if (playData) {
    playList.value = JSON.parse(playData)
  }
  if (localStorage.getItem("token")) {
    updateUserData();
  }
  
}

function updateUserData() {
  //获取用户信息
  
    getUserInfo().then((res) => {
      console.log(res);
      userInfo.value = res.data
    })
    updateLikeMusic();
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
  loadingMusic.value = false;
  if (sound.value) {
    sound.value.stop();
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
      loadingMusic.value = false;
    },
    onpause: () => {
      console.log("歌曲已暂停");
      lyric.value.pause();
      playing.value = false;
      loadingMusic.value = false;
    },
    onstop: () => {
      console.log("歌曲已停止");
      lyric.value.stop();
      playing.value = false;
      loadingMusic.value = false;
    },
    onend: () => {
      console.log("歌曲播放结束");
      lyric.value.stop();
      playing.value = false;
      loadingMusic.value = false;
      playNext();

    },
    onload: () => {
      console.log("歌曲已加载");
      lyric.value.stop();
      // 可以在这里获取歌曲信息，如时长
      let time = sound.value.duration(); // 秒
      duration.value = time;
      console.log("歌曲时长:", time);
      music_process.value = 0;
    },
    onseek: (id) => {
      console.log("onseek");
    },
  });
  console.log("准备播放");
  loadingMusic.value = true;
  sound.value.play(); // 加载完成后自动播放
}


function musicPlayListen() {
  if (playProcessTimer == null) {
    playProcessTimer = setInterval(() => {
      let value = Math.floor(sound.value.seek());
      if (Math.abs(value - music_process.value) < 2) {
        music_process.value = value;
      }
    }, 500);
  }
}

/**
 * 移除本地收藏
 */
function removeMusic(index, data) {
  playList.value.splice(index, 1);
  // saveLocalStorge();
  ElMessage({
    message: "移除:" + data.title + " " + data.artist,
    type: 'success',
  })
}

function requestDelLikeSong(data) {
   deleteDialog.value = true;
   removeLikeSongId.value = data.musicId;
}

function removeLikeSong() {

  // playList.value.splice(index, 1);
  removeLikeMusic([ removeLikeSongId.value]).then((res)=>{
    if(res.code === 200) {
      deleteDialog.value = false;
      ElMessage({
      message: "移除成功",
      type: 'success',
    })
    }
  })
}

/**
 * 添加播放列表
 */
function addLikeList(data) {
  if (data.sourceType == "NEW_EASY") {
    ElMessage({
      message: "NET_EASY 源不支持添加播放列表",
      type: 'error',
    })
    return;
  }
  data.name = data.title;
  data.musicId = data.id;
  addLikeMusic([data]).then((res)=>{
    if(res.code == 200) {
      ElMessage({
    message: "已添加:" + data.title + " " + data.artist,
    type: 'success',
  })
    }
  })
  // playList.value.push(data);
  // saveLocalStorge();
}
/**
 * 批量加入播放列表
 */
function playAll(musicData) {
  console.log(musicData)
  playList.value = [];
  playList.value.push(...musicData)
  songIndex.value = -1;
  playNext();
}

async function handlerMusic(data) {
  console.log("play info", data.url);
  await getMusicPlayDetailInfo(data);
  console.log("url", data.url)
  setSong(data.url);
  musicInfo.value = data;
  if (data.lyric != null) {
    lyric.value.addLyric(data.lyric);
  }
  ElMessage({
    message: "正在加载:" + data.title + " " + data.artist,
    type: 'message',
  })
}


async function getMusicPlayDetailInfo(data) {
  // return new Promise((resolve,reject)=>{
  switch (data.sourceType) {
    case "NET_EASY":
    case "SLIDER_KZ":
      break;
    case "HIFI_NI":
    case "BABY_MUSIC":
      await getMusicDetail(data.id, data.sourceType).then((res) => {
        data.url = res.data.url;
        data.lyric = res.data.lyric;
        data.imgUrl = res.data.imgUrl;
      });
      break;
    default:
      ElMessage.error("歌曲源不支持:" + data.sourceType);
  }
  return data;
}

/**
 * 下载音乐
 */
async function downMusic(data) {
  await getMusicPlayDetailInfo(data);

  ElMessageBox.alert(
    `<audio controls src="${data.url}" type="audio/mpeg">  
      您的浏览器不支持audio标签。  
    </audio>'
    <p>加载出进度后，点击三点下载</p>
    <p style="color:blue">${data.title}-${data.artist}
    `,
    '歌曲下载',
    {
      dangerouslyUseHTMLString: true,
    }
  )
  // downloadFile(data.url, data.title + "-" + data.artist + ".mp3");
}



function saveFile(data, fileName) {
  const exportBlob = new Blob([data])
  const saveLink = document.createElement('a')
  document.body.appendChild(saveLink)
  saveLink.style.display = 'none'
  var urlObject = window.URL.createObjectURL(exportBlob)
  saveLink.href = urlObject
  saveLink.download = fileName
  saveLink.click()
  document.body.removeChild(saveLink)
}

function downloadFile(fileUrl, fileName) {
  // 创建一个新的a标签  
  var link = document.createElement('a');
  link.href = fileUrl; // 设置文件的URL  
  link.download = fileName; // 设置下载文件的名称  
  link.style.display = 'none'; // 隐藏a标签
  link.target = '_blank'
  console.log(fileUrl, fileName);

  // 将a标签添加到DOM中  
  document.body.appendChild(link);

  // 模拟点击a标签以触发下载  
  link.click();

  // 下载触发后，立即从DOM中移除a标签  
  document.body.removeChild(link);
}

function saveLocalStorge() {
  //保存播放列表
  storage.removeItem('playList');
  storage.setItem('playList', JSON.stringify(playList.value));
}

//播放模式
function getPlaySongByMode(isNext = true) {
  let index = 0;
  switch (playMode.value) {
    case 'order':
        if(isNext) {
        index = (songIndex.value + 1) < playList.value.length ?
          songIndex.value + 1 : 0
      }else{
        index = (songIndex.value - 1) >= 0 ?
          songIndex.value - 1 : playList.value.length - 1;
      }
      break;
    case 'random':
      index = Math.floor(Math.random() * playList.value.length)
      break;
    case 'loop':
      index = songIndex.value;
      break;
    default:
      break;
  }
  songIndex.value = index
  return playList.value[index];
}

//音乐控制
function playPause() {
  if (!sound.value && playList.value.length > 0) {
    handlerMusic(playList.value[0]);
  }
  if (sound.value) {
    if (sound.value.playing()) {
      sound.value.pause();
    } else {
      sound.value.play();
    }
  }
}

function playPre() {
  if (playList.value) {
    
    handlerMusic(getPlaySongByMode(false));
  }
}

function playNext() {
  if (playList.value) {
    handlerMusic(getPlaySongByMode(true));
  }
}

function musicSeek() {
  let val = music_process.value;
  sound.value.seek(val);
  lyric.value.handleMusicTimeUpdate(val);
}

function volumnChange() {
  let v = (volumn.value / 100).toFixed(2)
  console.log("volume", v);
  sound.value.volume(v);
}

function updateLikeMusic() {
  getLikeSong(1,200).then((res)=>{
    console.log(res);
    cloudLikeSong.value = res.data.content;
  })
}

function login() {

  proxy.$socketIo.emit("qrLogin", "hello");
  ElNotification({
    title: '通知',
    message: '请稍等,正在获取登录二维码',
    type: 'info',
    duration: 2000
  })
}


function logout() {
  storage.removeItem("token");
  userInfo.value = {};
  cloudLikeSong.value = [];
}

</script>

<template>
  <el-row class="common-layout" justify="center">
    <!-- 删除确认弹窗 -->
    <el-dialog
    v-model="deleteDialog"
    title="Warning"
    width="500"
    align-center
  >
    <span>是否删除这个收藏歌曲</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="deleteDialog = false">取消</el-button>
        <el-button type="primary" @click="removeLikeSong">
          删除
        </el-button>
      </div>
    </template>
  </el-dialog>
    <!-- 登录二维码弹窗 -->
    <el-dialog v-model="qrShow" title="微信登录" width="500" style="text-align: center;">
      <img :src="qrImgUrl" style="width: 60%;" />
      <br>
      <i-fa-weixin style="font-size: 35px; color:#07c160;" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="qrShow = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    <el-col :xs="24" :sm="24" :md="22" :lg="20" :xl="18" class="box-container">
  
    <el-container  style="height: 100%">
      <el-header height="auto">
        <el-row :gutter="5" justify="space-between">
          <!-- <el-col :xs="20" :sm="14" :md="10" :lg="8" :xl="8"> -->
          <!-- <div class="flex-center"> -->
            <div class="flex-center" style="align-items: center;">
            <div class="input-div">
              <el-input v-model="keyWord" class="input-class" @keyup.enter="search" size="large" placeholder="输入关键词">
                <template #append>
                  <i-ep-search @click="search" class="search" />
                </template>
              </el-input>
            </div>
            <el-select v-model="selectMusicSource" size="default" placeholder="Select" style="width:150px; padding-left: 10px;">
              <el-option v-for="item in musicSources" :key="item.value" :label="item.label" :value="item.value"
              style="width: fit-content;" />
            </el-select>
            
          </div>
          <div style="color: #79bbff;font-weight: bold;">※仅用于技术学习交流</div>
            <div class="flex-center clickAble" v-if="!userInfo.avatar" @click="login">
              <el-tooltip
        class="box-item"
        effect="light"
        content="微信扫码登录"
        placement="bottom"
      >
              <i-lets-icons-user-cicrle style="height: 60px;width: 60px;color: chocolate;"/>
            </el-tooltip>
            </div>
              <div class="flex-center" v-else>
              <el-dropdown>
              <div class="flex-center">
                <img  :src="userInfo.avatar" style="height: 60px;width: 60px;border-radius: 50%;">
                <div style="font-size: 20px;color: black;padding: 7px;max-width: 200px;"> {{ userInfo.name}}</div>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>我的信息</el-dropdown-item>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <!-- </div> -->
          <!-- </el-col> -->
        </el-row>
      </el-header>

      <el-main>
        <el-row :gutter="5" justify="center" style="height: 100%">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" style="height: 100%">
            <el-tabs v-model="selectTab" tab-position="top" type="card" style="height: 100%">
              <el-tab-pane name="musciTable" label="播放列表">
                <el-table :data="playList" stripe style="width: 100%;height: 100%;">
                  <el-table-column fixed width="auto" min-width="10%" label="序号" type="index" />
                  <el-table-column width="auto" min-width="10%" label="源" prop="sourceType" />
                  <el-table-column width="auto" min-width="30%" label="歌曲" prop="title" />
                  <el-table-column width="auto" min-width="20%" label="歌手" prop="artist" />
                  <el-table-column width="auto" min-width="30%" align="right">

                    <!-- <template #header>
                      <el-input size="small" placeholder="Type to search" />
                    </template> -->

                    <template #default="scope">
                      <div class="musicOperator">
                        <i-ep-Headset style="color:rgb(5, 5, 207)" class="music_item_icon"
                          @click="handlerMusic(scope.row)"></i-ep-Headset>
                        <!-- <i-flat-color-icons:like
                          class="music_item_icon"
                        ></i-flat-color-icons:like> -->
                        <i-gg-remove style="color:rgb(153, 5, 5)" @click="removeMusic(scope.$index, scope.row)"
                          class="music_item_icon" />
                        <i-material-symbols-download-sharp class="music_item_icon" @click="downMusic(scope.row)" />
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <el-tab-pane name="cloudList" label="云端收藏">
                <el-table :data="cloudLikeSong" stripe style="width: 100%;height: 100%;">
                  <el-table-column fixed width="auto" min-width="10%" label="序号" type="index" />
                  <el-table-column width="auto" min-width="10%" label="源" prop="sourceType" />
                  <el-table-column width="auto" min-width="30%" label="歌曲" prop="title" />
                  <el-table-column width="auto" min-width="20%" label="歌手" prop="artist" />
                  <el-table-column width="auto" min-width="30%" align="right">

                    <template #header>
                      <div class="flex-center" style="justify-content: flex-end; padding: 0 5px 0 5px;">
                      <el-tooltip
                        class="box-item"
                        effect="light"
                        content="同步数据"
                        placement="bottom"
                      >
                      <i-radix-icons-update class="clickAble margin-lr5" style="color: #07c160;" @click="updateLikeMusic"></i-radix-icons-update>
                      </el-tooltip>
                      <el-tooltip
                        effect="light"
                        content="播放全部"
                        placement="bottom"
                      >
                        <i-bi-play-fill @click="playAll(cloudLikeSong)" class="clickAble margin-lr5" style="color: #79bbff;font-size: x-large;"></i-bi-play-fill>
                        </el-tooltip>
                      </div>
                    </template>

                    <template #default="scope">
                      <div class="musicOperator">
                        <i-ep-Headset style="color:rgb(5, 5, 207)" class="music_item_icon"
                          @click="handlerMusic(scope.row)"></i-ep-Headset>
                        <!-- <i-flat-color-icons:like
                          class="music_item_icon"
                        ></i-flat-color-icons:like> -->
                        <i-gg-remove style="color:rgb(153, 5, 5)" @click="requestDelLikeSong(scope.row)"
                          class="music_item_icon" />
                        <i-material-symbols-download-sharp class="music_item_icon" @click="downMusic(scope.row)" />
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <el-tab-pane name="lyric" label="歌词" style="height: 100%;overflow: hidden;">
                <lyric-view ref="lyric" style="height: 100%"></lyric-view>
              </el-tab-pane>
              <el-tab-pane name="searchResult" label="结果">
                <el-table v-if="musicSearchData" :data="musicSearchData.musicinfo" stripe
                  style="width: 100%;height: 100%;">
                  <el-table-column fixed width="auto" min-width="10%" label="序号" type="index" />
                  <el-table-column width="auto" min-width="30%" label="歌曲" prop="title" />
                  <el-table-column width="auto" min-width="30%" label="歌手" prop="artist" />
                  <el-table-column width="auto" min-width="30%" align="right">

                    <template #header>
                      <div class="flex-center" style="justify-content: flex-end;">
        
                      <el-tooltip
                        effect="light"
                        content="播放全部"
                        placement="bottom"
                      >
                        <i-bi-play-fill @click="playAll(musicSearchData.musicinfo)" class="clickAble" style="color: #79bbff;font-size: x-large;"></i-bi-play-fill>
                        </el-tooltip>
                      </div>
                    </template>

                    <template #default="scope">
                      <div class="musicOperator">
                        <i-ep-Headset class="music_item_icon" @click="handlerMusic(scope.row)"></i-ep-Headset>
                        <i-flat-color-icons:like class="music_item_icon" @click="addLikeList(scope.row)"></i-flat-color-icons:like>
                        <i-ph-playlist class="music_item_icon" @click="addPlayList(scope.row)"/>
                        <i-material-symbols-download-sharp class="music_item_icon" @click="downMusic(scope.row)" />
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-main>

      <el-footer height="auto">
        <!-- 播放进度条 -->
        <el-row style="flex-wrap:wrap">
          <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6" class="flex-center" style="align-items: center;justify-content: start;">
            <div class="playInfo">
              <el-image v-if="musicInfo != null && musicInfo.imgUrl != null"
                style="width: 100px; height: 100px; min-width:100px;display:block" :src="musicInfo.imgUrl"
                :fit="cover" />
              <i-ph-user-bold v-else style="width: 100px; height: 100px"></i-ph-user-bold>
            </div>
            <div style="padding-left:5px;overflow-x: auto">
              <el-tag type="primary" size="large" v-if="musicInfo != null">{{ musicInfo.artist == null ? "歌手" :
      musicInfo.artist }}</el-tag>
              <div style="height:6px"></div>
              <el-tag type="primary" size="large" v-if="musicInfo != null">{{ musicInfo.title == null ? "暂无歌曲" :
      musicInfo.title }}</el-tag>
            </div>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="flex-center" style="flex-direction:column">
            <div style="position: relative">
              <el-button @click="playPre" class="music_operator" type="primary" circle>

                <template #icon>
                  <i-ant-design-left-outlined />
                </template>
              </el-button>
              <el-button @click="playPause" class="music_operator" style="height: 70px; width: 70px; font-size: 40px"
                type="primary" size="medium" circle>

                <template #icon>
                  <i-line-md-downloading-loop v-if="loadingMusic" />
                  <i-bi-play-fill v-else-if="!playing" />
                  <i-ant-design-pause-outlined v-else />

                </template>
              </el-button>
              <el-button @click="playNext" class="music_operator" type="primary" circle>

                <template #icon>
                  <i-ant-design-right-outlined />
                </template>
              </el-button>
              <div class="playMode clickAble">
                <i-fe-list-order v-if="playMode === 'order'" @click="playMode = 'random'"  style="font-size: xx-large;"/>
                <i-fe-random v-if="playMode === 'random'" @click="playMode = 'loop'"  style="font-size: xx-large;"/>
                <i-fe-loop v-if="playMode === 'loop'" @click="playMode = 'order'"  style="font-size: xx-large;"/>
              </div >
              
            </div>

            <div class="flex-center" style="width:100%">
              <span class="processTime" style="padding-right:15px">{{ Math.trunc(music_process / 60) + ':' +
      (music_process % 60 < 10 ? ('0' + (music_process % 60).toFixed(0)) : (music_process % 60).toFixed(0)) }}</span>
                  <el-slider :show-tooltip=false v-model="music_process" :max="duration"
                    @change="musicSeek()"></el-slider>
                  <span class="processTime" style="padding-left:15px">{{ Math.trunc(duration / 60) + ':' + (duration %
      60 < 10 ? ('0' + (duration % 60).toFixed(0)) : (duration % 60).toFixed(0)) }}</span>
            </div>

            
          </el-col>

          <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6" class="flex-center" style="align-items:end"> 
            <div class="volumn">
              <i-uil-volume></i-uil-volume>
              <el-slider @change="volumnChange" :min=0 :max=100 :step=1 v-model="volumn" style="max-width:200px"
                size="small" />
            </div>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>
  </el-col>
  </el-row>
</template>

<style lang="less">
.music_item_icon {
  cursor: pointer;
}

.clickAble {
  cursor: pointer;
}

.clickAble:hover {

transform: scale(1.1);
/* 按钮点击时稍微缩小 */
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

.processTime {
  font-weight: bold;
  color: whitesmoke;
}

.volumn {
  // position: absolute;
  // right: 10px;
  width: 200px;
  min-width: 150px;
  padding: 0 30px 0 30px;
}

.common-layout {
  height: 100vh;
  // box-shadow: 0 0 30px 10px rgba(0, 0, 0, .3);
}

.box-container{
  height: 100%;
  background-color:rgba(73, 88, 95, 0.7);
  // background-image: url(@/assets/static/wenli2.png);
  // background-repeat: repeat;

  border-radius: 10px;
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
tr {
  background-color: hsla(0, 0%, 100%, 0.3) !important
}

td {
  background-color: hsla(0, 0%, 100%, 0.3) !important
}

.el-table {
  background-color: hsla(0, 0%, 100%, 0.3) !important;
}

.el-table th.el-table__cell {
  background-color: hsla(0, 0%, 98%, 0.3) !important
}

.el-table__row--striped {
  background-color: rgba(123, 206, 241, 0.5) !important
}

.el-tabs__header {
  border-bottom: none !important;
  
}

.el-table thead{
  color: black !important;
}

.el-tabs__nav {
  border: 1px solid whitesmoke !important;
  border-radius: 3px !important;

  .is-active {
    // color: #409eff !important;
    background-color: #383838c5 !important;
  }
}

.el-table__header-wrapper {
  background-color: whitesmoke;
}

.el-tabs__content {
  height: 90%;
  border-radius: 5px;
}

.el-tabs__item {
  color: whitesmoke !important;
}
.el-tooltip__trigger {
  outline: none !important;
}

.playMode {
  color: #409eff;
  position: absolute;
  right: -80px;
  bottom: 0px;
}
</style>
