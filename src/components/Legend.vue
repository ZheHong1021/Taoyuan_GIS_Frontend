<template>
    <div class="absolute px-4 py-2 rounded bg-white bottom-3 left-3" style='z-index: 1002'>
            <div class="mb-4">
                <h1 class="text-lg font-bold"><i class="fas fa-child text-xl text-yellow-400 mr-2"></i>鄉鎮區界線(人口數)</h1>
                <hr class="border-2 mb-2">

                <div id="district_block" class="flex" v-for="(item, index) in lengend_Style" :key="index">
                    <div  class="w-4 h-4 border-2 my-1" :style="{ background: item.bg_color }" ></div>
                    <label class="text-base mx-2" v-html="item.content"></label>
                </div>
            </div>
            <div class="mt-4">
                <i class="fas fa-map-marker-alt text-red-500 mr-2"></i>marker
                <hr class="border-2 mb-2">
                <p class="text-base" v-for="(item, index) in marker_Style" :key="index">
                    <i :class="item.icon"></i> 
                    {{item.name}}
                </p>
            </div>
        </div>
</template>
<script>
import { reactive } from '@vue/reactivity'
export default {
    name: 'Legend',
    setup(){
        const lengend_Style = reactive([
            {bg_color: "#ff3838", content: "&gt; 400000"},
            {bg_color: "#3742fa", content: "&gt; 200000"},
            {bg_color: "#fff200", content: "&gt; 100000"},
            {bg_color: "#c56cf0", content: "&gt; 50000"},
            {bg_color: "#7efff5", content: "&lt; 50000"},
        ])
        const marker_Style = reactive([
            {name: "商圈", icon: "fas fa-shopping-bag"},
            {name: "景點", icon: "fa fa-suitcase-rolling"},
            {name: "特色美食", icon: "fa fa-utensils"},
            {name: "火車站", icon: "fa fa-train"},
            {name: "高鐵站", icon: "fa fa-subway"},
            {name: "公車站牌", icon: "fa fa-bus"},
        ])
        return {lengend_Style, marker_Style}
    }

}
</script>

<style>

</style>