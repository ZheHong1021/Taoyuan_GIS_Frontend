<template>
  <div class="relative text-xl">
    <!-- Dialog -->
    <Dialog :header="dialog_Info.header" v-model:visible="is_View_Dialog"  :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '50vw'}" >
        <p v-html="dialog_Info.body"></p>
    </Dialog>

    <Dialog header="110年桃園觀光景點旅客數據" v-model:visible="is_Tourism_Dialog"  :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '50vw'}">
        <div class="mb-2">
            <button class="mx-2 bg-red-400 rounded px-4 py-2 text-white" @click="tourism_prop.month = '七月'">七月</button>
            <button class="mx-2 bg-red-400 rounded px-4 py-2 text-white" @click="tourism_prop.month = '六月'">六月</button>
            <button class="mx-2 bg-red-400 rounded px-4 py-2 text-white" @click="tourism_prop.month = '五月'">五月</button>
            <button class="mx-2 bg-red-400 rounded px-4 py-2 text-white" @click="tourism_prop.month = '四月'">四月</button>
        </div>
        <div class="mb-2">
            <button class="mx-2 bg-green-400 rounded px-4 py-2 text-white" @click="tourism_prop.type = 'bar'; tourism_prop.data = '門票收入';">門票收入</button>
            <button class="mx-2 bg-blue-400 rounded px-4 py-2 text-white" @click="tourism_prop.type = 'line'; tourism_prop.data = '遊客人次';">遊客人次</button>
        </div>
         <TourismData :tourism_prop="tourism_prop"/>
    </Dialog>

    <Dialog header="桃園交通工具" v-model:visible="is_Transport_Dialog"  :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '50vw'}">
        <Transportation/>
    </Dialog>




    <div class="absolute top-3 right-36 flex flex-col" style='z-index: 1003'>
        <button class="text-white text-xl font-bold rounded px-4 py-2"
            :class="is_Tourism_Dialog ? 'bg-green-700' : 'bg-green-500'"
            @click="is_Tourism_Dialog = true">
            景點旅客數據
        </button>
        <button class="text-white text-xl font-bold rounded px-4 py-2 mt-2"
            :class="is_Transport_Dialog ? 'bg-red-700' : 'bg-red-500'"
            @click="is_Transport_Dialog = true">
            交通資訊
        </button>
    </div>






    <!-- 區界 -->
    <DistrictPopup 
        :district="district"
        :population="population"
        v-show="show_district" 
        class="absolute px-4 py-2 rounded bg-white left-16 top-3"
    />
    <!-- 圖例 -->
    <Legend />
        
    <!-- 地圖 -->
    <div id="map" class="z-0"></div>


  </div>
</template>

<script>
import L from "leaflet";
import axios from 'axios';
import { onMounted, reactive, ref } from "vue";
import DistrictPopup from "@/components/DistrictPopup";
import Legend from "@/components/Legend";
import TourismData from "@/components/TourismData";
import Transportation from "@/components/Transportation";
import 'leaflet.markercluster';
import 'leaflet-fontawesome-markers'
import "leaflet-fontawesome-markers/L.Icon.FontAwesome.css"
import Dialog from 'primevue/dialog';
import Taoyuan_view from '@/assets/Taoyuan_view.json';
import {useStore} from 'vuex';
import { get_Train_Station, get_Thsr_Station, get_Taoyuan_BusStop} from "../api/api.js"; 



export default {
  name: "Map",
  components: {
    DistrictPopup: DistrictPopup,
    Dialog: Dialog,
    Legend: Legend,
    TourismData: TourismData,
    Transportation: Transportation,
  },
  setup() {
    //   預設
    const tourism_prop = reactive({
        type: 'bar',
        data: '門票收入',
        month: '七月',
    });
    
    const show_district = ref(false);
    const district = ref([]);
    const population = ref([]);
    const shopping_Area = ref([]);
    const is_View_Dialog = ref(false);
    const is_Tourism_Dialog = ref(false);
    const is_Transport_Dialog = ref(false);
    const dialog_Info = reactive({
        header: '',
        body: '',
    })

    var hereApiKey = "qcwHTsJura1qAf9AT75Nvl5DoolyvxQdAJmu-1wGTWQ"; // 您的 HERE APIKEY
    var dataHubReadToken = "APa7WWjkRhGKor_kt7QPQQA"; // 您的 Data Hub Token
    var distrcitSpaceId = "5b0dSwmn"; // 鄉鎮區界 Space ID
    // var markSpaceId = "jISwvF36"; // 桃園市座標點 Space ID
    var markFeatureGroup = L.markerClusterGroup(); // 座標點群組
    let shoppingAreaGroup = L.markerClusterGroup(); // 商圈群組
    let viewAreaGroup = L.markerClusterGroup(); // 景點群組
    let foodAreaGroup = L.markerClusterGroup(); // 特色美食群組
    let TrainAreaGroup = L.markerClusterGroup(); // 特色美食群組
    let ThsrAreaGroup = L.markerClusterGroup(); // 特色美食群組
    let BusAreaGroup = L.markerClusterGroup(); // 特色美食群組
    var map = null;
    const store = useStore();



    onMounted(async() => {

      map = L.map("map"); // 建立 L.map 物件。
      map.setView([24.926199764623497, 121.43325805664064], 10); // 設定地圖位置與 Z 階層，並讀取地圖
        var hereNormal = L.tileLayer(`https://{s}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${hereApiKey}`, {
          attribution: "© 2020 HERE",
          subdomains: [1, 2, 3, 4],
        }
      ).addTo(map); // 一般地圖

      var hereHybrid = L.tileLayer(
        `https://{s}.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/hybrid.day/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${hereApiKey}`, {
            attribution: '© 2020 HERE',
            subdomains: [1, 2, 3, 4]
        }
    ); // 衛星影像混合地圖

    var hereTerrain = L.tileLayer(
        `https://{s}.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/terrain.day/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${hereApiKey}`, {
                attribution: '© 2020 HERE',
                subdomains: [1, 2, 3, 4]
        }
    ); // 地形圖


         /* 區塊轉換 */
        var baseLayers = {
            'HERE 標準地圖': hereNormal,
            'HERE 衛星影像': hereHybrid,
            'HERE 地形圖': hereTerrain
        };

        var overlays = {
            // '圖資資訊座標': markFeatureGroup,
            '商圈': shoppingAreaGroup,
            '景點': viewAreaGroup,
            '特色美食': foodAreaGroup,
            '火車站': TrainAreaGroup,
            '高鐵站': ThsrAreaGroup,
            '公車站': BusAreaGroup,
        }

        L.control.layers(baseLayers, overlays, {
            collapsed: false
        }).addTo(map);

        store.commit('module_Map/set_InitialMap', map);
        await getTrain();
        await getThsr();
        await getBus();
        await getPopulation();
        await getView();
        await readDistrict(map); // 讀取鄉鎮區界線
        // getGeoJSONTiles(map.getBounds(), map.getZoom(), markSpaceId, dataHubReadToken, markFeatureGroup)

    });


    const getTrain = ()=>{
     get_Train_Station().then((res)=>{
        store.commit('module_Station/setTrainStation', res.data)
        res.data.forEach((item)=>{
            L.marker([item.StationPosition.PositionLat, item.StationPosition.PositionLon],{
                icon: L.icon.fontAwesome({ 
                    iconClasses: 'fa fa-train', // you _could_ add other icon classes, not tested.
                    markerColor: '#3867d6',
                    iconColor: '#ffffff',
                    // use XY offsets to nudge positioning of icons, negative accepted
                    iconXOffset: -1,
                    iconYOffset: 0,
                })
            }).bindPopup(`
                <h1 class = 'text-xl font-bold w-full bg-info'>${item.StationName.Zh_tw}火車站</h1>
            `).addTo(TrainAreaGroup);
        })
        }).catch((err)=>{
          console.log('連線異常:' + err);
        });
    }

    const getThsr = ()=>{
      get_Thsr_Station().then((res)=>{
        store.commit('module_Station/setHighSpeedStation', res.data)
        res.data.forEach((item)=>{
            L.marker([item.StationPosition.PositionLat, item.StationPosition.PositionLon],{
                icon: L.icon.fontAwesome({ 
                    iconClasses: 'fa fa-subway', // you _could_ add other icon classes, not tested.
                    markerColor: '#8854d0',
                    iconColor: '#ffffff',
                    // use XY offsets to nudge positioning of icons, negative accepted
                    iconXOffset: -1,
                    iconYOffset: 0,
                })
            }).bindPopup(`
                <h1 class = 'text-xl font-bold w-full bg-info'>${item.StationName.Zh_tw}高鐵站</h1>
            `).addTo(ThsrAreaGroup);
         })
      }).catch((err)=>{
          console.log('連線異常:' + err);
      });
    }
    const getBus = ()=>{
      get_Taoyuan_BusStop().then((res)=>{
          console.log(res.data);
        res.data.forEach((item)=>{
            L.marker([item.StopPosition.PositionLat, item.StopPosition.PositionLon],{
                icon: L.icon.fontAwesome({ 
                    iconClasses: 'fa fa-bus', // you _could_ add other icon classes, not tested.
                    markerColor: '#16a085',
                    iconColor: '#ffffff',
                    // use XY offsets to nudge positioning of icons, negative accepted
                    iconXOffset: -2,
                    iconYOffset: 0,
                })
            }).bindPopup(`
                <h1 class = 'text-xl font-bold w-full bg-info'>${item.StopName.Zh_tw}公車站</h1>
            `).addTo(BusAreaGroup);
         })
      }).catch((err)=>{
          console.log('連線異常:' + err);
      });
    }

    // 景點
    const getView = ()=>{
        Taoyuan_view.infos.forEach((item)=>{
            L.marker([item.Py, item.Px],{
                icon: L.icon.fontAwesome({ 
                    iconClasses: 'fa fa-suitcase-rolling', // you _could_ add other icon classes, not tested.
                    markerColor: '#273c75',
                    iconColor: '#ffffff',
                    // use XY offsets to nudge positioning of icons, negative accepted
                    iconYOffset: 0,
                })
            }).bindPopup(`
                <h1 class = 'text-xl font-bold w-full bg-info'>${item.Name}</h1>
                <a class = 'text-base' href="${item.TYWebsite}" target="_blank">網站連結</a>
                <p class = 'text-base font-bold w-full bg-info'>地址: ${item.Add}</p>
                <p class = 'text-base font-bold w-full bg-info'>開放時間: ${item.Opentime}</p>
                <p class = 'text-base font-bold w-full bg-info'>停車資訊: ${item.Parkinginfo}</p>
                <p class = 'text-base font-bold w-full bg-info'>票價資訊: ${item.Ticketinfo}</p>
                <p class = 'text-base font-bold w-full bg-info'>連絡電話: ${item.Tel}</p>
                <p class = 'text-base font-bold w-full bg-info'>備註: ${item.Remarks}</p>
            `).addTo(viewAreaGroup);
        });
        // viewAreaGroup.addTo(map);
    }


    
    // 人口數
    const getPopulation = () =>{
        axios.get('https://arcane-citadel-34528.herokuapp.com/api/population')
        // axios.get('http://127.0.0.1:8000/api/population')
            .then(response => {
                population.value = response.data.data;
            })
            .catch( err => {
                console.log('error=' + err);
        })
    }

    // 特色推薦美食
    axios.get('https://arcane-citadel-34528.herokuapp.com/api/food_recommend')
    // axios.get('http://127.0.0.1:8000/api/food_recommend')
            .then(response => {
                response.data.data.forEach((item)=>{
                    L.marker([item.latitude, item.longitude],{
                    icon: L.icon.fontAwesome({ 
                        iconClasses: 'fa fa-utensils', // you _could_ add other icon classes, not tested.
                        markerColor: '#fff',
                        iconColor: 'purple',
                        iconYOffset: 0,
                        })
                    }).bindPopup(`
                        <h1 class = 'text-xl font-bold w-full bg-info'>${item.name}</h1>
                        <p class = 'text-base font-bold w-full bg-info'>${item.phone}</p>
                        <p class = 'text-base font-bold w-full bg-info'>${item.address}</p>
                    `).addTo(foodAreaGroup);
                })
            })
            .catch( err => {
                console.log('error=' + err);
        })



     window.openDialog = (header, content)=>{
         is_View_Dialog.value = true;
        dialog_Info.header = header;
        dialog_Info.body = content;
    };// 解決字串模板@click無效的問題

    axios.get('https://arcane-citadel-34528.herokuapp.com/api/shopping')
    // axios.get('http://127.0.0.1:8000/api/shopping')
        .then(response => {
            shopping_Area.value = response.data.data;
            shopping_Area.value.forEach((area)=>{
                L.marker([area.longitude, area.latitude],{
                    icon: L.icon.fontAwesome({ 
                        iconClasses: 'fa fa-shopping-bag', // you _could_ add other icon classes, not tested.
                        markerColor: '#f7b731',
                        iconColor: '#000000',
                         // use XY offsets to nudge positioning of icons, negative accepted
                        iconXOffset: -1, 
                        iconYOffset: 0,
                    })
                }).bindPopup(`
                    <h1 class = 'text-xl font-bold w-full bg-info'>${area.name}</h1>
                    <div class = 'pt-4 text-white text-lg'>
                        <button onclick="openDialog('${area.name} (介紹)','${area.description.replaceAll("\n","<br />")}')" class='bg-blue-500 rounded px-2 py-1 font-bold mx-1'>商圈介紹</button>
                        <button onclick="openDialog('${area.name} (交通方式)','${area.transportation.replaceAll("\n","<br />")}')" class='bg-green-500 rounded px-2 py-1 font-bold mx-1'>交通方式</button>
                        <button onclick="openDialog('${area.name} (組織)','${area.organization}')" class='bg-red-500 rounded px-2 py-1 font-bold mx-1'>商圈組織</button>
                    </div>
                `).addTo(shoppingAreaGroup);
            });
        })
        .catch( err => {
            console.log('error=' + err);
        })


    // 單一鄉鎮區總人口
    // 抓取到的第一個就是我們目前選擇的district，因為抓回來是Object，讀取total
    // const getSinglePopulation = (single_district)=>  population.value.filter( element =>element.district == single_district)[0].total;
    const getSinglePopulation = (single_district)=>  population.value.length > 0 ? population.value.filter( element =>element.district == single_district)[0].total : 0;
    
    const readDistrict = (map)=>{
        $.getJSON(
        `https://xyz.api.here.com/hub/spaces/${distrcitSpaceId}/iterate?clip=true&access_token=${dataHubReadToken}`,
            (value) => {
            value.features.forEach((element) => {
                const single_population = getSinglePopulation(element.properties.TOWNNAME);
                var bg_color = "#7efff5";
                if(single_population > 400000){ bg_color = "#ff3838";}
                else if(single_population > 200000){ bg_color = "#3742fa";}
                else if(single_population > 100000){bg_color = "#fff200";}
                else if(single_population > 50000){bg_color = "#c56cf0";}
                else{bg_color = "#7efff5";}

                L.geoJSON(element, {
                    style: {
                        fillColor: bg_color,
                        color: "#0032ff",
                        weight: 3,
                        fill: true,
                    },
                    // 移動的顏色
                    onEachFeature(feature, layer) {
                        layer.on("mouseover", function () {
                            show_district.value = true;
                            district.value = feature;
                            this.setStyle({
                                fillColor: "#40407a",
                                // fillColor: "#ff0000",
                            });
                        });
                        layer.on("mouseout", function () {
                            show_district.value = false;
                            district.value = [];
                            this.setStyle({
                                fillColor: bg_color,
                            });
                        });
                    },
                }).addTo(map);
            });
            }
        );
    }

    function getGeoJSONTiles(bounds, zoom, spaceId, accessToken) {
      var min = map.project(bounds.getNorthWest(), zoom).divideBy(256).floor(),
        max = map.project(bounds.getSouthEast(), zoom).divideBy(256).floor();
        for (var i = min.x; i <= max.x; i++) {
            for (var j = min.y; j <= max.y; j++) {
                const coords = new L.Point(i, j);
                var x = coords.x,
                    y = coords.y,
                    z = zoom;
                $.getJSON(
                    `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/web/${z}_${x}_${y}?access_token=${accessToken}`,
                    (value) => {
                        var geoJsonLayer = L.geoJson(value, {
                            onEachFeature: function (feature, layer) {
                                layer.bindPopup(`
                                    <h1 class='text-base'>${feature.properties.MARKNAME2}</h1>
                                `);
                            }
                        });
                        markFeatureGroup.addLayer(geoJsonLayer);
                    }
                )
            }
        }
    }

    return { show_district, district, population, shopping_Area, is_View_Dialog, dialog_Info, is_Tourism_Dialog, is_Transport_Dialog,
        getSinglePopulation, getGeoJSONTiles, tourism_prop };
  }
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 100vh;
}
</style>


