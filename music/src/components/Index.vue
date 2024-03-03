<script setup>
import { ref, onMounted } from 'vue'
import { searchMusic } from '@/api/MusicApi'

//======================变量定义区============================
//歌词
var lyric = ref(null)
//音乐搜索结果
const searchListStatus = ref(false)
let lrc = "[00:00.000] 作词 : 徐誉滕\n[00:01.000] 作曲 : 徐誉滕\n[00:07.620]落叶随风将要去何方\n[00:12.900]只留给天空美丽一场\n[00:20.100]曾飞舞的身影\n[00:22.590]像天使的翅膀\n[00:25.650]划过我幸福的过往\n[00:32.929]爱曾经来到过的地方\n[00:39.129]依昔留着昨天的芬芳\n[00:45.069]那熟悉的温暖\n[00:48.439]像天使的翅膀\n[00:51.899]划过我无边的心上\n[00:57.999]相信你还在这里\n[01:02.029]从不曾离去\n[01:05.590]我的爱像天使守护你\n[01:10.969]若生命直到这里\n[01:14.969]从此没有我\n[01:17.479]我会找个天使替我去爱你\n[01:37.609]爱曾经来到过的地方\n[01:44.149]依昔留着昨天的芬芳\n[01:49.678]那熟悉的温暖\n[01:53.660]像天使的翅膀\n[01:56.559]划过我无边的心上\n[02:02.689]相信你还在这里\n[02:07.170]从不曾离去\n[02:10.419]我的爱像天使守护你\n[02:15.990]若生命直到这里\n[02:20.700]从此没有我\n[02:22.600]我会找个天使替我去爱你\n[02:55.550]相信你还在这里\n[03:02.300]从不曾离去\n[03:03.630]我的爱像天使守护你\n[03:09.480]若生命直到这里\n[03:13.450]从此没有我\n[03:16.000]我会找个天使替我去爱你\n[03:22.380]我会找个天使替我去爱你\n"
//定时器索引
let index = 0;
var type = ref("i-ep-add-location");
var keyWord = ref("");
var musicSearchData = ref(null);

//==================生命周期函数区============================
onMounted(() => {
  console.log(`the component is now mounted.`)

  // 延迟使用，因为还没有返回跟挂载
  nextTick(() => {
    lyric.value.addLyric(lrc)
  })
})

//========================定时器区============================
setInterval(() => {
  console.log("timer", index)
  lyric.value.handleMusicTimeUpdate(index);
  index += 3;
}, 1000);
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
</script>

<template>
  <!-- 搜索结果抽屉 -->
  <el-drawer v-model="searchListStatus" title="音乐搜索结果" size="40%" :with-header="false">
    <el-table :data="musicSearchData.musicinfo" stripe style="width: 100%">
    <el-table-column label="歌曲" prop="title" />
    <el-table-column label="歌手" prop="artist" />
    <el-table-column align="right">
      <template #header>  
        <el-input  size="small" placeholder="Type to search" />
      </template>
      <template #default="scope">
        <!-- <el-button size="small" @click="handleEdit(scope.$index, scope.row)"
          >Edit</el-button
        > -->
        <div class="musicOperator">
          <i-ep-CirclePlus></i-ep-CirclePlus>
          <i-flat-color-icons:like/>
        </div>
        <!-- <el-button
          size="small"
          type="danger"
          @click="handleDelete(scope.$index, scope.row)"
          >Delete</el-button -->
        <!-- > -->
      </template>
    </el-table-column>
  </el-table>
  </el-drawer>

  <!-- <el-contaniner>
    <el-header>Header</el-header>
    <el-main>main</el-main>
    <el-footer>Footer</el-footer>
  </el-contaniner> -->


  <el-row :gutter="5" justify="center">
    <el-col :xs="14" :sm="10" :md="8" :lg="8" :xl="8">
      <div class="input-div">
        <el-input v-model="keyWord" class="input-class" size="large" placeholder="输入关键词">
          <template #append>
            <i-ep-search @click="search" class="search" />
          </template>
        </el-input>
      </div>
    </el-col>
  </el-row>
  <el-row :gutter="5" justify="center">
    <el-col :xs="14" :sm="10" :md="8" :lg="8" :xl="8">
      <lyric-view ref="lyric" style="height: 300px;"></lyric-view>
    </el-col>
  </el-row>
  <el-button @click="callLrc">调用子组件</el-button>
</template>

<style lang="scss">
.input-div {
  width: 100%;
  border-radius: 95px;
  background-color: #ffffff;
  border-radius: 95px;
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

.musicOperator{
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;

  }
</style>
