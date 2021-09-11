<template>
  <div class="relative">
    <DistrictPopup 
        :district="district"
        :population="population"
        v-show="show_district" 
        class="absolute px-4 py-2 rounded bg-white text-lg left-16 top-3"/>
    <div id="map" class="z-0"></div>
  </div>
</template>

<script>
import L from "leaflet";
import axios from 'axios';
import { onMounted, ref } from "vue";
import DistrictPopup from "@/components/DistrictPopup";
import 'leaflet.markercluster';
export default {
  name: "Map",
  components: {
    DistrictPopup: DistrictPopup,
  },
  setup() {
    const show_district = ref(false);
    const district = ref([]);
    const population = ref([]);

    var hereApiKey = "qcwHTsJura1qAf9AT75Nvl5DoolyvxQdAJmu-1wGTWQ"; // 您的 HERE APIKEY
    var dataHubReadToken = "APa7WWjkRhGKor_kt7QPQQA"; // 您的 Data Hub Token
    var distrcitSpaceId = "5b0dSwmn"; // 鄉鎮區界 Space ID
    var markSpaceId = "jISwvF36"; // 桃園市座標點 Space ID
    var markFeatureGroup = L.markerClusterGroup(); // 座標點群組
    var map = null;

    onMounted(() => {

        axios.get('http://127.0.0.1:8000/api/population')
            .then(response => {
                population.value = response.data.data;
            })
            .catch( err => {
                console.log('error=' + err);
            })


        axios.get('http://127.0.0.1:8000/api/shopping')
            .then(response => {
                console.log(response);
            })
            .catch( err => {
                console.log('error=' + err);
            })


    
      map = L.map("map"); // 建立 L.map 物件。
      map.setView([24.926199764623497, 121.43325805664064], 10); // 設定地圖位置與 Z 階層，並讀取地圖
      L.tileLayer(`https://{s}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${hereApiKey}`, {
          attribution: "© 2020 HERE",
          subdomains: [1, 2, 3, 4],
        }
      ).addTo(map); // 一般地圖

        readDistrict(map); // 讀取鄉鎮區界線
        getGeoJSONTiles(map.getBounds(), map.getZoom(), markSpaceId, dataHubReadToken, markFeatureGroup)



        var overlays = {
            'marked': markFeatureGroup,
        };

        L.control.layers({}, overlays, {
            collapsed: false
        }).addTo(map);              
    });


    // 單一鄉鎮區總人口
    const getSingleDistrict = ()=>{
        // 抓取到的第一個就是我們目前選擇的district，因為抓回來是Object，讀取total
        return population.value.filter( element =>element.district == district.value.properties.TOWNNAME)[0].total;
    }


    const readDistrict = (map)=>{
        $.getJSON(
        `https://xyz.api.here.com/hub/spaces/${distrcitSpaceId}/iterate?access_token=${dataHubReadToken}`,
            (value) => {
            value.features.forEach((element) => {
                L.geoJSON(element, {
                style: {
                    color: "#0032ff",
                    opacity: 0.8,
                    weight: 4,
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
                            fillColor: "#0032ff",
                        });
                    });
                    layer.on("click", function(){
                        
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


    return { show_district, district, population, getSingleDistrict };
  }
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 100vh;
}
</style>


