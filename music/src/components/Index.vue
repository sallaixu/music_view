<script setup>
import { ref ,onMounted } from 'vue'
onMounted(() => {
  console.log(`the component is now mounted.`)
  let lrc = "[00:00.000] 作词 : 徐誉滕\n[00:01.000] 作曲 : 徐誉滕\n[00:07.620]落叶随风将要去何方\n[00:12.900]只留给天空美丽一场\n[00:20.100]曾飞舞的身影\n[00:22.590]像天使的翅膀\n[00:25.650]划过我幸福的过往\n[00:32.929]爱曾经来到过的地方\n[00:39.129]依昔留着昨天的芬芳\n[00:45.069]那熟悉的温暖\n[00:48.439]像天使的翅膀\n[00:51.899]划过我无边的心上\n[00:57.999]相信你还在这里\n[01:02.029]从不曾离去\n[01:05.590]我的爱像天使守护你\n[01:10.969]若生命直到这里\n[01:14.969]从此没有我\n[01:17.479]我会找个天使替我去爱你\n[01:37.609]爱曾经来到过的地方\n[01:44.149]依昔留着昨天的芬芳\n[01:49.678]那熟悉的温暖\n[01:53.660]像天使的翅膀\n[01:56.559]划过我无边的心上\n[02:02.689]相信你还在这里\n[02:07.170]从不曾离去\n[02:10.419]我的爱像天使守护你\n[02:15.990]若生命直到这里\n[02:20.700]从此没有我\n[02:22.600]我会找个天使替我去爱你\n[02:55.550]相信你还在这里\n[03:02.300]从不曾离去\n[03:03.630]我的爱像天使守护你\n[03:09.480]若生命直到这里\n[03:13.450]从此没有我\n[03:16.000]我会找个天使替我去爱你\n[03:22.380]我会找个天使替我去爱你\n"
  const lyricView = ref(null)
    // 延迟使用，因为还没有返回跟挂载
    nextTick(() => {
      lyricView.value.setLyric(lrc)
    })
})
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
var type = ref("i-ep-add-location");
var serach = ref("");
</script>

<template>
  <el-row :gutter="5" justify="center">
    <el-col :xs="14" :sm="10" :md="8" :lg="8" :xl="8">
      <div class="input-div">
        <el-input v-model="serach" class="input-class" size="large" placeholder="输入关键词">
            <template #append><i-ep-search /></template>
        </el-input>
    </div>
    </el-col>
  </el-row>
  <el-row :gutter="5" justify="center">
    <el-col :xs="14" :sm="10" :md="8" :lg="8" :xl="8">
      <lyric-view :ref="lyricView"></lyric-view>
    </el-col>
  </el-row>
</template>

<style lang="less">
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
    }
}

</style>
