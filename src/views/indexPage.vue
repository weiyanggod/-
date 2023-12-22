<script setup>
import AMapLoader from '@amap/amap-jsapi-loader'
import { onMounted, ref, reactive, toRaw } from 'vue'
import { searchAPI, getListAPI, addSiteAPI, delSiteAPI } from '@/api/index.js'
import { ElMessage } from 'element-plus'
let AMap = null
let map = null
let mouseTool = null
let coveringList = []
let groupList = reactive([
  {
    value: 'site',
    label: '站点'
  },
  {
    value: 'group',
    label: '分组'
  },
  {
    value: 'landStatus',
    label: '土地性质'
  }
])
let groupName = ref('group')
let searchValue = ref()
let railBorderColor = ref('#ff33ff')
let railBottomColor = ref('#1791fc')
let tableData = ref([])
let polygonList = []
let signList = []

// 获取列表
const getList = () => {
  getListAPI().then(({ data }) => {
    tableData.value = data
    initMap()
    map ? map.clearMap() : ''
  })
}
// 初始化地图
const initMap = async () => {
  window._AMapSecurityConfig = {
    securityJsCode: '4dfbd3ce4cb7fc0e3d76c0831263a33c'
  }
  AMap = await AMapLoader.load({
    key: '35037ea8f35be185dea66c9f13aa1e2c', // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0' // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
  })
  map = new AMap.Map('container', {
    //设置地图容器id
    // viewMode: '3D', //是否为3D地图模式
    zoom: 10, //初始化地图级别
    center: tableData.value[0] ? getCenter(toRaw(tableData.value[0])) : ['120.750865', '30.762653'] //初始化地图中心点位置,
  })
  //添加插件
  AMap.plugin(
    [
      'AMap.InfoWindow',
      'AMap.ToolBar',
      'AMap.Scale',
      'AMap.MapType',
      'AMap.MouseTool',
      'AMap.GeoJSON'
    ],
    function () {
      let tool = new AMap.ToolBar()
      let scale = new AMap.Scale()
      let type = new AMap.MapType({
        defaultType: 0
      })
      map.addControl(tool)
      map.addControl(scale)
      map.addControl(type)
    }
  )
  map.clearMap()
  createShroud()

  // 事件
  mouseTool = new AMap.MouseTool(map)
  mouseTool.on('draw', function (event) {
    tableData.value.unshift({
      field0002: '',
      field0003: '',
      field0004: '',
      field0005: event.obj.getOptions().path,
      railBorderColor: railBorderColor.value,
      railBottomColor: railBottomColor.value
    })
    coveringList.push(event.obj)
  })
  return AMap
}

// 创建覆盖物
const createShroud = () => {
  if (AMap) {
    tableData.value.forEach((item) => {
      let data = JSON.parse(toRaw(item).field0005)
      var polygonPath = data.features[0].geometry.coordinates
      // 创建面覆盖物
      var polygon = new AMap.Polygon({
        path: polygonPath,
        fillColor: data.properties.railBottomColor,
        strokeColor: data.properties.railBorderColor
      })
      addSign(item)
      map.add(polygon)
      polygonList.push({ item, polygon })
    })
    map.setFitView(null, false, [150, 60, 100, 60])
  }
}

// 搜索
const search = () => {
  let url = ''
  let paramsName = ''
  if (groupName.value === 'site') {
    url = '/listByName'
    paramsName = 'field0003'
  }
  if (groupName.value === 'group') {
    url = '/listByGroup'
    paramsName = 'field0002'
  }
  if (groupName.value === 'landStatus') {
    url = '/listByNature'
    paramsName = 'field0004'
  }
  const params = {}
  params[`${paramsName}`] = searchValue.value
  if (searchValue.value) {
    searchAPI({ url, params }).then(({ data }) => {
      tableData.value = data
      map.clearMap()
      createShroud()
    })
  } else {
    getListAPI().then(({ data }) => {
      tableData.value = data
      map.clearMap()
      createShroud()
    })
  }
}

// 开始绘制
const startDrawing = () => {
  mouseTool.polygon({
    fillColor: railBottomColor.value,
    strokeColor: railBorderColor.value
  })
}

// 结束绘制
const endDrawing = () => {
  mouseTool.close(false)
  railBorderColor.value = '#ff33ff'
  railBottomColor.value = '#1791fc'
}

// 保存站点
const saveSite = (row) => {
  row = toRaw(row)
  if (Array.isArray(row.field0005)) {
    row.field0005 = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            coordinates: row.field0005
          }
        }
      ],
      properties: {
        railBorderColor: row.railBorderColor,
        railBottomColor: row.railBottomColor
      }
    })
  }

  delete row.railBorderColor
  delete row.railBottomColor
  addSiteAPI({
    ...row
  }).then(() => {
    ElMessage({
      message: '保存成功',
      type: 'success'
    })
    addSign(row)
  })
}

// 删除站点
const delSite = async (row) => {
  row = toRaw(row)
  await delSiteAPI(row.field0001)
  search()
}

// 定位站点
const locationSite = (row) => {
  map.setCenter(getCenter(row))
  polygonList.forEach((i) => {
    if (i.item === row) {
      map.setFitView([i.polygon], false, [150, 60, 100, 60])
    }
  })
}

// 获取中心
const getCenter = (row) => {
  row = toRaw(row)
  let coordinates = null
  let center = [0, 0]
  let data = JSON.parse(row.field0005)
  // 如果是geojson格式
  if (data.type) {
    coordinates = data.features[0].geometry.coordinates
    coordinates.forEach((item) => {
      center[0] += item[0]
      center[1] += item[1]
    })
  } else {
    coordinates = data
    coordinates.forEach((item) => {
      center[0] += item[0]
      center[1] += item[1]
    })
  }
  return [center[0] / coordinates.length, center[1] / coordinates.length]
}

// 添加标记
const addSign = (item) => {
  // 先删除点标记
  signList.forEach((i) => {
    if (i.item === item) {
      map.remove(i.sign)
    }
  })
  // 添加点标记
  item = toRaw(item)
  const sign = new AMap.Text({
    text: item.field0003,
    map: map,
    position: getCenter(item),
    anchor: 'center',
    style: {
      padding: '10px',
      'border-radius': '10px',
      'background-color': 'white',
      'max-width': '150px',
      'border-width': 0,
      'box-shadow': '0 2px 6px 0 rgba(114, 124, 245, .5)',
      'text-align': 'center',
      'font-size': '16px',
      'word-wrap': 'break-word',
      'white-space': 'pre-wrap',
      color: '#000'
    }
  })
  signList.push({ item, sign })
}

// 页面渲染完成后触发
onMounted(() => {
  getList()
})
</script>

<template>
  <el-row>
    <el-col :span="16">
      <div id="container"></div>
    </el-col>
    <el-col :span="8" style="padding: 10px">
      <el-row class="row-bg" justify="space-between">
        <el-col :span="4">
          <el-select style="width: 100%" v-model="groupName" class="m-2">
            <el-option
              v-for="item in groupList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="16">
          <el-input style="width: 100%" v-model="searchValue" clearable placeholder="请输入" />
        </el-col>
        <el-col :span="3">
          <el-button style="width: 100%" type="primary" round @click="search">搜索</el-button>
        </el-col>
      </el-row>
      <el-row class="row-bg" justify="space-between" style="margin-top: 10px">
        <el-col :span="3">
          <el-input disabled placeholder="围栏边框" />
        </el-col>
        <el-col :span="2">
          <el-color-picker v-model="railBorderColor" show-alpha />
        </el-col>
        <el-col :span="3">
          <el-input style="width: 100%" disabled placeholder="围栏底色" />
        </el-col>
        <el-col :span="2">
          <el-color-picker v-model="railBottomColor" show-alpha />
        </el-col>
        <el-col :span="4">
          <el-button style="width: 100%" type="primary" @click="startDrawing">开始绘制</el-button>
        </el-col>
        <el-col :span="4">
          <el-button style="width: 100%" type="primary" @click="endDrawing">结束绘制</el-button>
        </el-col>
        <el-col :span="3">
          <el-input style="width: 100%" disabled :placeholder="`合计:` + tableData.length" />
        </el-col>
      </el-row>
      <el-table max-height="70vh" :data="tableData" border style="width: 100%; margin-top: 10px">
        <el-table-column prop="site" label="地块名称" width="200">
          <template v-slot="{ row }">
            <el-input size="small" v-model="row.field0003" />
          </template>
        </el-table-column>
        <el-table-column prop="landStatus" label="土地性质" width="100">
          <template v-slot="{ row }">
            <el-input size="small" v-model="row.field0004" />
          </template>
        </el-table-column>
        <el-table-column prop="group" label="分组" width="100">
          <template v-slot="{ row }">
            <el-input size="small" v-model="row.field0002" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="操作" width="220">
          <template v-slot="{ row }">
            <el-button
              @click="saveSite(row)"
              type="success"
              round
              style="padding: 0px 13px; margin-left: 0px"
              size="small"
              >保存</el-button
            >
            <el-button
              @click="delSite(row)"
              type="danger"
              round
              style="padding: 0px 13px; margin-left: 0px"
              size="small"
              >删除</el-button
            >
            <el-button
              @click="locationSite(row)"
              type="primary"
              round
              style="padding: 0px 13px; margin-left: 0px"
              size="small"
              >定位</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>
<style lang="scss" scoped>
#container {
  height: 100vh;
}
::v-deep .amap-logo {
  display: none;
  opacity: 0 !important;
}
::v-deep .amap-copyright {
  opacity: 0;
}
</style>
