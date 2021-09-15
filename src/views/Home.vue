<template>
  <div class="flex flex-row w-full p-3">
        <div 
            class="mx-2 bg-green-400 rounded shadow-lg p-3 font-bold text-xl "
            v-for="(route, index) in route_List" 
            :key="index">
              <router-link :to='route.to' :href='route.href' role="tab">
                <div class="">{{ route.title }}</div>
            </router-link>
        </div>
    </div>
</template>

<script>
import { reactive } from '@vue/reactivity'
export default {
    setup(){
        const route_List = reactive([
            {id:'tra', title: '台鐵資訊', to: '/tra'},
            {id:'thsr', title: '高鐵資訊', to: '/thsr'},
            {id:'bus', title: '公車資訊', to: '/bus'},
        ])

     
        return { route_List }
    }

}
</script>