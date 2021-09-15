
export default {
    namespaced: true,
    state: {
        map: null,
        currentPos: []
    },
    
    mutations: {
        set_InitialMap(state, payload){
            state.map = payload;
        },
        set_CurrentPos(state, payload){
            state.currentPos = payload;
        },

    }
  }