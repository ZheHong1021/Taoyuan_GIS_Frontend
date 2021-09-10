import Vuex from 'vuex';
import L from 'leaflet';
const store = new Vuex.Store({//使用Vuex.Store 取得之
  state: {
      map: null,
      hereApiKey: 'qcwHTsJura1qAf9AT75Nvl5DoolyvxQdAJmu-1wGTWQ', // 您的 HERE APIKEY
      dataHubReadToken: 'APa7WWjkRhGKor_kt7QPQQA', // 您的 Data Hub Token
  },
  actions: {
    setInitMap: ({ commit }) => commit('setInitMap') ,
  },
  mutations: {
    setInitMap (state) {
      var hereNormal = L.tileLayer(`https://{s}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${hereApiKey}`, {
        attribution: '© 2020 HERE',
        subdomains: [1, 2, 3, 4]
      }).addTo(state.map); // 一般地圖

    var hereHybrid = L.tileLayer(`https://{s}.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/hybrid.day/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${hereApiKey}`, {
        attribution: '© 2020 HERE',
        subdomains: [1, 2, 3, 4]
    }); // 衛星影像

    var hereTerrain = L.tileLayer(`https://{s}.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/terrain.day/{z}/{x}/{y}/256/png8?lg=cht&ppi=72&pois&apiKey=${hereApiKey}`, {
        attribution: '© 2020 HERE',
        subdomains: [1, 2, 3, 4]
    }); // 地形圖
    
    
        var baseLayers = {
            'HERE 標準地圖': hereNormal,
            'HERE 衛星影像': hereHybrid,
            'HERE 地形圖': hereTerrain
        };

        var overlays = {
        };

        L.control.layers(baseLayers, overlays, {
            collapsed: false
        }).addTo(map);        



    } ,
  },
  getters: {
    
  }
});

export default store;