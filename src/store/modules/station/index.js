export default {
    namespaced: true,
    state:{
      train: [],
      new_train: [],
      high_Speed_Rail: [],
      new_high_Speed_Rail: [],
    },
    
    mutations:{
      setTrainStation(state, payload){
        state.train = payload;
      },
      setHighSpeedStation(state, payload){
        state.high_Speed_Rail = payload;
      },

      setNewStation(state, payload){
        const category = payload == 'train' ? state.train : state.high_Speed_Rail
        const new_arr = payload == 'train' ? state.new_train : state.new_high_Speed_Rail
        


        // 火車想要做GroupDropDown，所以必須列出該車站的所在城市，其他種類則不用
        if( payload === 'train'){
          let city_include = []
          Object.keys(category).forEach(function (key) {
            const city_name = category[key].LocationCity.substr(0,2)
            if(city_include.includes(city_name) ){
              new_arr[city_include.length - 1].station.push({
                name: category[key].StationName.Zh_tw, 
                id: category[key].StationID,
              })
            }else{
            new_arr.push({
              city: city_name,
              station: [{
                name: category[key].StationName.Zh_tw, 
                id: category[key].StationID,
              }]
            })
            city_include.push(city_name)
          }
        })
      }else{
        Object.keys(category).forEach(function (key) {
            new_arr.push({
              name: category[key].StationName.Zh_tw, 
              id: category[key].StationID,
            })
          })
      }

      }
      
    },
    getters:{
      get_NewTrainArr_Length(state){
        return state.new_train.length === 0;
      },
      get_NewThsrArr_Length(state){
        return state.new_high_Speed_Rail.length === 0;
      },
    },
  }