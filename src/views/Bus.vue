<template>
    <loading v-model:active="isLoading"
      :is-full-page="true"
      loader= "dots"
      />
  <section  class="w-full flex flex-col justify-center items-center" >
    <h1 class="text-center text-3xl font-bold my-2">公車資訊查詢</h1>
    <div class="my-3 w-full" v-if="api_Response.total_Routes.length > 0">
        <div class="w-full my-4 p-1 rounded-full border-2 border-gray-700 flex items-center">
          <label for="searchBar"><i class="fas fa-search p-1 text-lg cursor-pointer w-1/12 hover:text-blue-400"></i></label>
          <input id="searchBar" v-model="filter_Search" type="text" placeholder="查詢路線" class="w-10/12 mx-2 bg-transparent text-black outline-none h-full text-lg"/>
          <i class="fas fa-times p-1 text-lg cursor-pointer w-1/12 hover:text-blue-400" v-if="filter_Search !== ''" @click="filter_Search = ''"></i>
        </div>

          <span v-if="filter_Route().length === 0" class="text-base font-bold mb-4">
            目前找不到您所搜尋的路線，請重新搜尋。
          </span>

        <Accordion class="w-full" @tab-open="open_Route" @tab-close="close_Route">
            <!-- Page逐一顯示，透過總頁數 % 目前一次顯示的數量，=> 假設共138頁，最後一頁 index只會跑到 8 -->
            <AccordionTab v-for="(_,index) in pageRow_Route() " :key="index">
              <!-- Header -->
              <template #header>
                <i class="fas fa-bus"></i>
                <label id="routeName" class="mx-2 mr-6"> {{ filter_Route()[currentPage * 10 + index].RouteName.Zh_tw  }} </label>
                <span>
                  <label >{{filter_Route()[currentPage * 10 + index].DepartureStopNameZh }}</label>
                  <i class="fas fa-arrow-circle-right text-lg"></i>
                  <label >{{filter_Route()[currentPage * 10 + index].DestinationStopNameZh }}</label>
                </span>
              </template>
                        
              <!-- Body -->
                <div v-show="filter_Route().length !== 0">
                  <!-- 用 sticky滾動時會一直存在 -->
                  <div id="route_Header" class="sticky" style="top: 20px">
                      <span class="rounded p-2 bg-purple-700 text-white font-bold text-lg " >下次更新時間: {{update_Count}}</span>
                      <span class="rounded p-2 bg-red-500 text-white font-bold text-lg ml-3 cursor-pointer" @click="refresh_Route_Info(choose_Info.direction)">刷新</span>
                      <span class="rounded p-2 bg-green-400 text-white font-bold text-lg ml-3 cursor-pointer" @click="direct()">導引</span>
                      <div class="w-full flex justify-center mb-6 mt-4">
                          <Button @click="refresh_Route_Info(0)" :label="'往' + filter_Route()[currentPage * 10 + index].DestinationStopNameZh" class="font-bold p-button-raised"
                            :class="choose_Info.direction !== 0 ? 'p-button-text' : ''" />
                          <Button @click="refresh_Route_Info(1)" :label="'往' + filter_Route()[currentPage * 10 + index].DepartureStopNameZh" class="font-bold p-button-raised"
                            :class="choose_Info.direction !== 1 ? 'p-button-text' : ''" />
                      </div>
                  </div>
                    <!-- 一定要有該Object才能顯示，否則會 Error -->
                    <div v-if="object_isEmpty(esimate_Arrival) === false && isLoading === false">
                      <div v-for="(stop, index) in api_Response.bus_stop" :key="index">
                          <!-- 預估到站時間( 1 min > : 進站中； 3 min >: 準備進站； 3 min<: 正常顯示時間； 沒有預估時間: 顯示目前站點狀況 ) -->
                          <h1 class="my-4">
                              <span 
                                  v-if="esimate_Arrival[stop.StopUID].estimateTime >= 0 && Math.ceil(esimate_Arrival[stop.StopUID].estimateTime / 60) <= 3"
                                  class="px-4 py-1 rounded text-white"
                                  :class="Math.ceil(esimate_Arrival[stop.StopUID].estimateTime / 60) <= 1 ? 'bg-red-500' : 'bg-yellow-500'"
                                  v-text="Math.ceil(esimate_Arrival[stop.StopUID].estimateTime / 60) <= 1 ? '進站中' : '準備進站'">
                              </span>
                              <span 
                                  v-else-if="Math.ceil(esimate_Arrival[stop.StopUID].estimateTime / 60)"
                                  class="px-4 py-1 rounded text-white bg-green-500">
                                  {{Math.ceil(esimate_Arrival[stop.StopUID].estimateTime / 60) + '分' }}
                              </span>
                              <span 
                                  v-else
                                  class="px-4 py-1 rounded text-white bg-gray-500">
                                  {{ esimate_Arrival[stop.StopUID].nextBusTime ? nextBusTimeConfig(esimate_Arrival[stop.StopUID].nextBusTime) : StopStatus[esimate_Arrival[stop.StopUID].stopStatus] }}
                              </span>

                              <label class="ml-2">
                                {{ stop.StopName.Zh_tw }}
                                <span class="p-2 ml-2 rounded bg-indigo-300" 
                                  v-if="current_StopUID_Arr.includes(stop.StopUID) && api_Response.current_BusInStop">
                                  <!-- 目前公車位於哪個站點[index].PlateNumb -->
                                  {{ api_Response.current_BusInStop[current_StopUID_Arr.indexOf(stop.StopUID)].PlateNumb }}
                                </span>
                              </label>
                          </h1>
                      </div>
                    </div>
                </div>
              </AccordionTab>
        </Accordion>

      <Paginator :pageLinkSize="4" :rows="10" :totalRecords="filter_Route().length" :rowsPerPageOptions="[10,20,30]" @page="onPage($event)"
          template="PrevPageLink PageLinks  NextPageLink RowsPerPageDropdown">
           <template #right="slotProps">
             <h1 class="mt-3">
              單頁顯示數量: {{slotProps.state.rows}}，總路線數量: {{ filter_Route().length }}
             </h1>
          </template>
      </Paginator>
      </div>

  </section>



</template>

<script>
import { reactive, ref } from '@vue/reactivity'
import 'vue-loading-overlay/dist/vue-loading.css';
import 'leaflet-fontawesome-markers'
import "leaflet-fontawesome-markers/L.Icon.FontAwesome.css"
import { get_Bus_Route, get_Bus_StopOfRoute, get_Bus_DisplayStopOfRoute, get_Bus_EstimatedTimeOfArrival, get_Bus_RealTimeByFrequency,  get_Bus_RealTimeNearStop} from "../api/api.js"; 
import Loading from 'vue-loading-overlay';
import L from 'leaflet'
import Button from 'primevue/button';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Paginator from 'primevue/paginator';
import { useStore } from 'vuex' // Composition API
import { onEachFeature } from '../utilities/geoJSON'
import { onMounted } from '@vue/runtime-core';

export default {
  components: {
    Loading: Loading,
    Button: Button,
    Accordion: Accordion,
    AccordionTab: AccordionTab,
    Paginator: Paginator,
  },
  setup(){
      // Call Store
      const store = useStore();
      // Store State
      const map = store.state.module_Map.map;
      const bus_Route_Marker = store.state.module_Marker.bus_Route_Marker;
      let polyLine_Bus = store.state.module_Marker.polyLine_Bus;
      const yellowIcon = L.icon.fontAwesome({ 
          iconClasses: 'fa fa-bus', // you _could_ add other icon classes, not tested.
          markerColor: '#26de81',
          iconColor: '#ffffff',
          
          // use XY offsets to nudge positioning of icons, negative accepted
          iconXOffset: -2, 
          iconYOffset: 0,
      })
        const redIcon = L.icon.fontAwesome({ 
            iconClasses: 'fa fa-bus', // you _could_ add other icon classes, not tested.
            markerColor: '#eb3b5a',
            iconColor: '#ffffff',
            // use XY offsets to nudge positioning of icons, negative accepted
            iconXOffset: -2, 
            iconYOffset: 0,
        })

    

      // 選擇查詢的資訊(城市、路線)
      const choose_Info = reactive({
        city: '桃園市',
        city_en: 'Taoyuan',
        routeUID: '',
        direction: 0,  // 預設順行
      })



      // API Respones
      const api_Response = reactive({
        total_Routes: [],
        total_Stops: [],
        bus_stop: [], // 整理過的
        current_BusInStop: [],
        current_BusInPos: [],
      })

      // 預估時間
      const esimate_Arrival = reactive({})
      
      const filter_Search = ref('')

      // Page Config
      const currentPage = ref( 0 );
      const currentPageRow = ref( 10 );
      
      // Interval Config
      const updateInterval = ref('');
      const updateInterval_Count = ref('');
      const update_Time = ref(15); // 更新時間
      const update_Count = ref(15);  // 更新倒數(扣到0再變回 15)


      // Loading Config
      const isLoading = ref(false);

      onMounted(async()=>{
        // 載入該縣市所有路線的 API
          await get_Bus_Route(choose_Info.city_en)
            .then( (res)=>{
              api_Response.total_Routes = res.data;
          }).catch( (err)=>{
              console.log('連線異常:' + err);
              error_Request()
          })        
      })
      

      // [0:'正常',1:'尚未發車',2:'交管不停靠',3:'末班車已過',4:'今日未營運']   
      const StopStatus  = reactive(['正常', '尚未發車', '暫不停靠', '末班車已過', '今日停駛'])
      
      // 因為下列這些縣市的公車，會有多種子路線導致很難顯示，則使用另一個API (DisplayStopOfRoute)
      const AllowDisplayStop = reactive(['Taipei', 'Tainan', 'NewTaipei', 'Taoyuan', 'Taichung'])

      // 開啟 Accordion，匯入該路線API資訊
      const open_Route = async (event)=>{
        bus_Route_Marker.clearLayers();
        Current_Marker_Bus.clearLayers()
        map.removeLayer(polyLine_Bus);

        // 抓取開啟的 Tab =>為陣列中[頁數 *10 + 該頁的第幾個]
        choose_Info.routeUID = filter_Route()[currentPage.value*10 + event.index].RouteUID
        // 不為 DisplayStopOfRoute所提供的縣市，選擇 get_Bus_StopOfRoute
        const api_choose  = AllowDisplayStop.includes(choose_Info.city_en) ? get_Bus_DisplayStopOfRoute : get_Bus_StopOfRoute;
            await api_choose( {city: choose_Info.city_en, routeUID: choose_Info.routeUID} )
            .then( (res)=>{
              api_Response.total_Stops = res.data;
              refresh_Route_Info(0);  // 起始載入，行駛方向為順向
              setTimeout(show_Bus_Marker_And_PolyLine(), 1000)  // 顯示站點座標，設個延遲避免資料還沒讀取好
            }).catch( (err)=>{
                console.log('連線異常:' + err);
                error_Request()
            })
      }

      // 關閉 Accordion(中斷計時、清除地圖座標)
      const close_Route = () =>{
        choose_Info.routeUID = "";
        clearInterval(updateInterval.value)
        clearInterval(updateInterval_Count.value)
        bus_Route_Marker.clearLayers();
        Current_Marker_Bus.clearLayers()
        map.removeLayer(polyLine_Bus);
      }

      // 觸發條件(1:打開 Accordion、 2: 點擊改變順/逆行按鈕)
      const refresh_Route_Info = (direction)=>{
        choose_Info.direction = direction;  // 更新行駛方向

        // 先刷新資料(重新計時、站點更新、座標清除)
        AllowDisplayStop.includes(choose_Info.city_en) ? get_DisplayStopOfRoute() :  get_StopOfRoute();
        clearInterval(updateInterval.value)
        clearInterval(updateInterval_Count.value)
        update_Count.value = 15
        current_StopUID_Arr.value = [];
        

        // Loading Animation .5s
        isLoading.value = true;
          setTimeout(()=>{
            // 確定預估時間真的有載入
            // if(!object_isEmpty(esimate_Arrival)){
              isLoading.value = false;

              updateInterval_Count.value = setInterval(()=>{
                  update_Count.value--;
                  // update_Time = 15 (這樣只要改 update_Time之後，全部都會改了)
                  if(update_Count.value === 0) update_Count.value = update_Time.value;
              }, 1000)

              updateInterval.value = setInterval(()=>{
                AllowDisplayStop.includes(choose_Info.city_en) ? get_DisplayStopOfRoute() :  get_StopOfRoute()
              }, update_Time.value * 1000);
            // }
          }, 1000)
      }

      // 因為每個路線都會有數個子路線，而我們要將每個子路線的行駛方向所經過的站點都抓近來(抓站點最多的)
      const get_StopOfRoute = ()=>{
            let maxStopLength = 0;
            let max_index = 0
            let SubRouteNum = Object.keys(api_Response.total_Stops).length; // 子路線數量(站點最多)
            for(let index = 0; index< SubRouteNum ; index++){
              // 且這子路線的行駛方向要跟 direction相同
                if(api_Response.total_Stops[index].Direction === choose_Info.direction){
                  const stop = api_Response.total_Stops[index].Stops;
                  const stop_Length = stop.length;
                  // 如果路線長度大於最大，則記錄起來
                  if(stop_Length > maxStopLength){
                    maxStopLength = stop_Length
                    max_index = index  // 紀錄哪一個是站點最多的子路線
                }
              }
            }
            // 最後將站點最多的留下來(而這邊還有部分班次的特殊站點需要去做處理)
            api_Response.bus_stop = api_Response.total_Stops[max_index].Stops
            
            // 這邊設定 1s再去 get_EstimatedTimeOfArrival函式處理資料後才能顯示，否則會有 error
            setTimeout(()=>{
              get_EstimatedTimeOfArrival()
              get_Current_BusPosition()
           }, 1000)
      }


      // DisplayStopOfRoute為整理好的總路線站點(只有順行、逆行兩條)，而上面沒Display則為沒整理的(順行跟逆行可能各有好幾條)，所以我們要幫忙整理
      const get_DisplayStopOfRoute = ()=>{
        // 路線數量
        let SubRouteNum = Object.keys(api_Response.total_Stops).length;
        // 預估時間
        for(let index = 0; index< SubRouteNum ; index++){
          // 子路線的行駛方向要跟 direction相同，才能紀錄
            if(api_Response.total_Stops[index].Direction === choose_Info.direction){
              api_Response.bus_stop = api_Response.total_Stops[index].Stops
            }
          }
          get_EstimatedTimeOfArrival()
          get_Current_BusPosition()
      }

      const show_Bus_Marker_And_PolyLine = ()=>{
          let marker_PolyLine_arr = []  // 紀錄 PolyLine的 [[緯度1, 經度1], [緯度2, 經度2], ......]
          Object.entries(api_Response.bus_stop).forEach(([, value]) => {
            marker_PolyLine_arr.push(new L.LatLng(value.StopPosition.PositionLat, value.StopPosition.PositionLon));
            var geojsonFeature = {
              "type": "Feature",
              "properties": {
                "name": `No.${value.StopSequence}_${value.StopName.Zh_tw}`,
                'category': '公車',
                "latitude": value.StopPosition.PositionLat,
                "longitude": value.StopPosition.PositionLon,
              },
              "geometry": {
                "type": "Point",
                // !!!! 這邊經度要在前面
                "coordinates": [value.StopPosition.PositionLon, value.StopPosition.PositionLat]
              }
            };
            L.geoJSON(geojsonFeature, {
              onEachFeature: onEachFeature, // utilities/geoJSON.js
              pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                  icon: yellowIcon
                });
              },
            }).addTo(bus_Route_Marker);
          });

          bus_Route_Marker.addTo(map);
          polyLine_Bus = new L.Polyline(marker_PolyLine_arr, {
              smoothFactor: 1,
              className: 'bus_polyline'
          }).addTo(map);
      }

      // 將得到的 API新建成一個物件，利用站點的StopUID來去呼叫該站點的資訊(估計時間、車班號)
      const get_EstimatedTimeOfArrival = async()=>{
          await get_Bus_EstimatedTimeOfArrival({
              city: choose_Info.city_en, 
              routeUID: choose_Info.routeUID
          })
              .then( (res)=>{
                Object.entries(res.data).forEach(([, value]) => {
                  // 目前行駛(順行: 1；逆行: 0)；未行駛: 255
                  if(value.Direction == choose_Info.direction || value.Direction == '255'){
                    // 情況1: 沒有在Object中，直接紀錄
                    // 情況2: 有在 Object中，判斷有預估時間或到站時間最短者優先紀錄
                    // 情況3: 有在 Object中，但記錄的時間較短 ->剔除
                    // 情況3: 有在 Object中，無預估時間 ->剔除
                    if( Object.prototype.hasOwnProperty.call(esimate_Arrival, value.StopUID) ){
                      if(esimate_Arrival[value.StopUID] == 'underfined' || esimate_Arrival[value.StopUID].estimateTime < value.EstimateTime){
                        return;
                      }
                    }
                      esimate_Arrival[value.StopUID] = {
                        estimateTime: value.EstimateTime,  // 預估時間
                        stopStatus: value.StopStatus,   // 行駛情況
                        nextBusTime: value.NextBusTime ? value.NextBusTime : ''
                      };
                  }
                });
            }).catch( (err)=>{
                console.log('連線異常:' + err);
                error_Request();
            });
      }

      const current_StopUID_Arr = ref([])
      let Current_Marker_Bus = L.layerGroup();

      // 抓到目前公車所在位置
      const get_Current_BusPosition = ()=>{
        // 記得要初始化
        Current_Marker_Bus.clearLayers()
        Promise.all([
          get_Bus_RealTimeByFrequency({
              city : choose_Info.city_en, 
              routeUID : choose_Info.routeUID,
          }),
          get_Bus_RealTimeNearStop({
              city : choose_Info.city_en, 
              routeUID : choose_Info.routeUID,
          })
        ])
        .then( (response) => {
            api_Response.current_BusInPos = response[0].data
            api_Response.current_BusInStop = response[1].data

            api_Response.current_BusInStop.forEach((data)=>{
              if(data.Direction === choose_Info.direction){
                  current_StopUID_Arr.value.push(data.StopUID);
              }
            })
            api_Response.current_BusInPos.forEach((data)=>{
              if(data.Direction === choose_Info.direction){
                  L.marker( [data.BusPosition.PositionLat, data.BusPosition.PositionLon], {icon:  redIcon})
                  .addTo(Current_Marker_Bus)
                  .bindPopup(`<h1 class='text-xl font-bold text-red-500'>目前公車位置 - ${data.PlateNumb}</h1>`).openPopup();
                  Current_Marker_Bus.addTo(map);
              }
            })
        })
      }


      // 導引 Click Event
      const direct = ()=>{
        // Stop Array
        const stop = api_Response.bus_stop
        let start_Lat = stop[0].StopPosition.PositionLat;
        let start_Lng = stop[0].StopPosition.PositionLon;
        let end_Lat =   stop[stop.length - 1].StopPosition.PositionLat;
        let end_Lng =   stop[stop.length - 1].StopPosition.PositionLon;
        map.fitBounds([
          [start_Lat, start_Lng],
          [end_Lat, end_Lng]
        ]);
      }
        // Page Event
        const onPage = (event)=>{
            currentPage.value = event.page;
            currentPageRow.value = event.rows;
            close_Route(); // 換頁時也初始化
        }
        
        // PageRow設定: 到最後一頁則顯示 總路線數量 - ( 第幾頁n * 單頁數量m )，其他都以單頁數量顯示
        const pageRow_Route = ()=> filter_Route().length - (currentPage.value * currentPageRow.value) > currentPageRow.value ? currentPageRow.value : filter_Route().length - (currentPage.value * currentPageRow.value)
        const object_isEmpty = (object)=> Object.keys(object).length === 0 ? true : false;
        const error_Request = ()=> confirm('連線異常，請重新整理，造成不便十分抱歉😥') ? location.reload() : ''

        // filter Search (只要搜尋文字有包含在路線名稱、起站、迄站則都會顯示)
        const filter_Route = ()=>  api_Response.total_Routes.filter((route)=> route.RouteName.Zh_tw.includes(filter_Search.value) || route.DepartureStopNameZh.includes(filter_Search.value) || route.DestinationStopNameZh.includes(filter_Search.value) ) 
       
        const nextBusTimeConfig = (date) => `${new Date(date).getHours()} : ${ new Date(date).getMinutes() > 10 ? new Date(date).getMinutes() : '0' + new Date(date).getMinutes()}`

    return {isLoading,  choose_Info, api_Response, currentPage, currentPageRow, StopStatus, esimate_Arrival, filter_Search,  update_Count, current_StopUID_Arr,
             open_Route, close_Route, get_StopOfRoute, onPage, object_isEmpty, refresh_Route_Info, direct, filter_Route, pageRow_Route, nextBusTimeConfig}
  }

}
</script>

<style>
.bus_polyline { 
	stroke: red;
}



</style>