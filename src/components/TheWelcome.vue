<script setup>
import AMapLoader from '@amap/amap-jsapi-loader'
import { reactive, ref } from 'vue'
import img from '../assets/images/地图标点@2x.png'
import dayjs from 'dayjs'
const state = reactive({
  path: [],
  current_position: []
})
const tableData = [
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: 'xxxxxxxx项目',
    name: '2023-10-10',
    address: 'No. 189, Grove St, Los Angeles'
  }
]
window._AMapSecurityConfig = {
  securityJsCode: '4dfbd3ce4cb7fc0e3d76c0831263a33c'
}
function initMap() {
  AMapLoader.load({
    key: '35037ea8f35be185dea66c9f13aa1e2c', // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0' // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
  })
    .then((AMap) => {
      const map = new AMap.Map('container', {
        //设置地图容器id
        // viewMode: '3D', //是否为3D地图模式
        zoom: 13, //初始化地图级别
        center: [120.884133005202, 30.677314574960842], //初始化地图中心点位置,
        zoomEnable: false,
        dragEnable: false
      })
      //添加插件
      AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.DistrictSearch'], function () {})
      // 单击
      map.on('click', (e) => {
        state.current_position = [e.lnglat.KL, e.lnglat.kT]
        state.path.push([e.lnglat.KL, e.lnglat.kT])
        addPolyLine()
        map.setFitView()
      })
      map.setMapStyle('amap://styles/darkblue')

      // 折线
      function addPolyLine() {
        const polyline = new AMap.Polyline({
          path: state.path,
          isOutline: true,
          outlineColor: '#ffeeff',
          borderWeight: 1,
          strokeColor: '#3366FF',
          strokeOpacity: 0.6,
          strokeWeight: 5,
          // 折线样式还支持 'dashed'
          strokeStyle: 'solid',
          // strokeStyle是dashed时有效
          // strokeDasharray: [10, 5],
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 50
        })
        map.add([polyline])
      }
      let polygons = []
      let makerList = []
      let citySearch = new AMap.DistrictSearch({
        subdistrict: 0, //获取边界不需要返回下级行政区
        extensions: 'all', //返回行政区边界坐标组等具体信息
        level: 'district',
        showbiz: false
      })
      // 搜索所有省/直辖市信息
      citySearch.search('平湖市', function (status, result) {
        // 查询成功时，result即为对应的行政区信息
        result.districtList[0].boundaries.forEach((item) => {
          var polygon = new AMap.Polygon({
            strokeWeight: 1,
            path: item,
            fillOpacity: 0.4,
            fillColor: '#002fa3',
            strokeColor: '#3e65ce'
          })
          polygons.push(polygon)
        })
        map.add(polygons)
        map.setFitView(polygons)
      })
      function punctuate() {
        let icon = new AMap.Icon({
          size: new AMap.Size(40, 100), // 图标尺寸
          image: img, // Icon的图像
          imageSize: new AMap.Size(40, 40) // 根据所设置的大小拉伸或压缩图片
          // imageOffset: new AMap.Pixel(0, 0) // 图像相对展示区域的偏移量，适于雪碧图等
        })
        makerList.forEach((item) => {
          // 遍历生成多个标记点
          let marker = new AMap.Marker({
            map: map,
            zIndex: 9999999,
            icon: icon, // 添加 Icon 实例
            offset: new AMap.Pixel(0, 0), //icon中心点的偏移量
            position: item // 经纬度对象new AMap.LngLat(x, y)，也可以是经纬度构成的一维数组[116.39, 39.9]
          })
          map.add(marker)
        })
      }
      let coordinateSearch = new AMap.DistrictSearch({
        subdistrict: 1, //获取边界不需要返回下级行政区
        // extensions: 'all', //返回行政区边界坐标组等具体信息
        level: 'district',
        showbiz: false
      })
      coordinateSearch.search('平湖市', function (status, result) {
        // 查询成功时，result即为对应的行政区信息
        result.districtList[0].districtList.forEach((item) => {
          makerList.push([item.center.lng, item.center.lat])
        })
        punctuate()
      })
    })
    .catch((e) => {
      console.log(e)
    })
}
function headerCellStyle() {
  return {
    background: '#0d346b',
    border: '1px solid #0d244c',
    color: '#fff'
  }
}
function cellStyle({ rowIndex }) {
  console.log(rowIndex)
  if (rowIndex % 2 === 0) {
    return {
      background: '#0b2049',
      color: '#fff',
      border: '1px solid #0d244c'
    }
  } else {
    return {
      background: '#0d244c',
      color: '#fff',
      border: '1px solid #0b2049'
    }
  }
}
initMap()
let date = ref(dayjs().format('YYYY-MM-DD '))
let time = ref(dayjs().format('HH:mm:ss'))
setInterval(() => {
  console.log(999)
  date.value = dayjs().format('YYYY-MM-DD ')
  time.value = dayjs().format('HH:mm:ss')
}, 1000)
</script>

<template>
  <div class="bgc">
    <img src="../assets/images/背景.png" alt="" />
  </div>
  <div class="project">
    <div class="status">
      <div class="text">本年重点项目情况</div>
    </div>
    <div></div>
    <div class="list">
      <div class="text">项目列表</div>
    </div>
    <div class="table">
      <el-table
        :data="tableData"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        stripe
        style="width: 100%"
        height="550px"
      >
        <el-table-column prop="date" label="项目名称" width="auto" align="center" />
        <el-table-column prop="name" label="立项日期" width="auto" align="center" />
        <el-table-column prop="name" label="亮灯状态" width="auto" align="center">
          <template v-slot="{ $index }">
            <img
              v-if="$index % 2 === 0"
              src="../assets/images/黄灯1.png"
              alt=""
              style="width: 20px; height: 20px"
            />
            <img v-else src="../assets/images/红灯1.png" alt="" style="width: 20px; height: 20px" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <div class="time">
    <div style="display: flex; justify-content: center; flex-direction: column">
      <div style="font-size: 12px; height: 12px">{{ date }}</div>
      <div style="font-size: 10px; margin-left: 20px; height: 20px">{{ time }}</div>
    </div>
    <img
      src="../assets/images/形状 1182.png"
      alt=""
      style="width: 2px; height: 20px; margin: 0px 15px"
    />
    <img
      src="../assets/images/形状 1189.png"
      alt=""
      style="width: 20px; height: 20px; margin: 0px 10px"
    />
    <img
      src="../assets/images/形状 1188.png"
      alt=""
      style="width: 10px; height: 15px; margin: 0px 10px"
    />
    <div>17˚C</div>
  </div>
  <div id="container"></div>
</template>
<style scoped>
img {
  width: 100%;
  height: 100vh;
}
#container {
  position: fixed;
  right: 2%;
  top: 52%;
  padding: 0px;
  margin: 0px;
  width: 70%;
  height: 88vh;
  padding: 50px;
  transform: translate(0, -50%);
}
.project {
  position: fixed;
  left: 2%;
  top: 10%;
  width: 25%;
  height: 85vh;
  background-color: #051436;
  border-radius: 5px;
}
.project .status {
  background-image: url('../assets/images/项目筛选类型.png');
  color: #fff;
  width: 90%;
  height: 50px;
  margin-top: 20px;
  margin-left: 50%;
  transform: translate(-50%, 0);
  padding-top: 10px;
  padding-left: 10px;
  font-size: 14px;
  font-style: italic;
  font-weight: 900;
}
.project .list {
  display: flex;
  background: url('../assets/images/灰色素材.png') no-repeat;
  width: 90%;
  height: 20px;
  color: #fff;
  margin-top: 50px;
  margin-left: 23px;
}
.project .list .text {
  margin-left: 30px;
  font-style: italic;
  font-size: 14px;
}
.table {
  margin-top: 20px;
  width: 90%;
  height: 550px;
  margin-left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  justify-content: center;
  background-color: #0d346b;
}
.time {
  position: fixed;
  /* width: 200px; */
  height: 30px;
  top: 2.7%;
  right: 3%;
  z-index: 9999;
  color: #fff;
  display: flex;
  align-items: center;
}
</style>
