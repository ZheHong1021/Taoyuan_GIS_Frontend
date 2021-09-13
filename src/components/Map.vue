<template>
  <div class="relative text-xl">
    <!-- Dialog -->
    <Dialog :header="dialog_Info.header" v-model:visible="is_Dialog"  :breakpoints="{'960px': '75vw', '640px': '100vw'}" :style="{width: '50vw'}" >
        <p v-html="dialog_Info.body"></p>
    </Dialog>

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
import 'leaflet.markercluster';
import 'leaflet-fontawesome-markers'
import "leaflet-fontawesome-markers/L.Icon.FontAwesome.css"
import Dialog from 'primevue/dialog';
import webActivity from '@/assets/WebActivity.json';


export default {
  name: "Map",
  components: {
    DistrictPopup: DistrictPopup,
    Dialog: Dialog,
    Legend: Legend,
  },
  setup() {
    const show_district = ref(false);
    const district = ref([]);
    const population = ref([]);
    const shopping_Area = ref([]);
    const is_Dialog = ref(false);
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
    var map = null;

    onMounted(() => {
        console.log(webActivity);

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
            '圖資資訊座標': markFeatureGroup,
            '商圈': shoppingAreaGroup,
        }

        L.control.layers(baseLayers, overlays, {
            collapsed: false
        }).addTo(map);        
        
        
        readDistrict(map); // 讀取鄉鎮區界線
        // getGeoJSONTiles(map.getBounds(), map.getZoom(), markSpaceId, dataHubReadToken, markFeatureGroup)
    });

    
    axios.get('https://arcane-citadel-34528.herokuapp.com/api/population')
    // axios.get('http://127.0.0.1:8000/api/population')
        .then(response => {
            population.value = response.data.data;
        })
        .catch( err => {
            console.log('error=' + err);
    })

     window.openDialog = (header, content)=>{
         is_Dialog.value = true;
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
            shoppingAreaGroup.addTo(map);
        })
        .catch( err => {
            console.log('error=' + err);
        })





    // 單一鄉鎮區總人口
    // 抓取到的第一個就是我們目前選擇的district，因為抓回來是Object，讀取total
    const getSinglePopulation = (single_district)=>  population.value.length >0 ? population.value.filter( element =>element.district == single_district)[0].total : 0;
    const readDistrict = (map)=>{
        $.getJSON(
        `https://xyz.api.here.com/hub/spaces/${distrcitSpaceId}/iterate?clip=true&access_token=${dataHubReadToken}`,
            (value) => {
            value.features.forEach((element) => {
                const single_population = getSinglePopulation(element.properties.TOWNNAME);
                var bg_color = "#7efff5";
                if(single_population > 400000){
                    bg_color = "#ff3838";
                }else if(single_population > 200000){
                    bg_color = "#3742fa";
                }else if(single_population > 100000){
                    bg_color = "#fff200";
                }else if(single_population > 50000){
                    bg_color = "#c56cf0";
                }else{
                    bg_color = "#7efff5";
                }
                L.geoJSON(element, {
                    style: {
                        fillColor: bg_color,
                        color: "#0032ff",
                        weight: 3,
                        fill: true,
                    },
                    onEachFeature(feature, layer) {
                        layer.on("mouseover", function () {
                            show_district.value = true;
                            district.value = feature;
                            this.setStyle({
                                fillColor: "#ff0000",
                            });
                        });
                        layer.on("mouseout", function () {
                            show_district.value = false;
                            district.value = [];
                            this.setStyle({
                                fillColor: bg_color,
                            });
                        });
                        // layer.on("click", function(){
                            
                        // });
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


    return { show_district, district, population, shopping_Area, is_Dialog, dialog_Info,
        getSinglePopulation, getGeoJSONTiles };
  }
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 100vh;
}
</style>


