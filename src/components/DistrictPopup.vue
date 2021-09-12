<template>
  <div class='district_style'>
        <h1 v-if="district.properties" class="font-bold">
            <p><i class="fas fa-city"></i>{{district.properties.TOWNNAME}}</p>
            <p>人口數量: {{getSinglePopulation }}</p>
            <p>佔桃園市人口比例: {{  getPercentage(getSinglePopulation, getTotalPopulation) }}%</p>
            <p>最高人口比例: {{  getPercentage(max_Population, getTotalPopulation) }}%</p>
            <p>最低人口比例: {{  getPercentage(min_Population, getTotalPopulation)  }}%</p>
            <p>桃園市人口數: {{ getTotalPopulation }}</p>
        </h1>
            
  </div>
</template>

<script>
import { computed, toRef } from 'vue'
export default {
    props: {
        district: Object,
        population: Object,
    },
    setup(props){
        const population = toRef(props, 'population');
        const district = toRef(props, 'district');

        const getPercentage = (partialValue, totalValue) => Math.round((partialValue *100 / totalValue) * 100) / 100;
        
        // 單一鄉鎮區總人口
        // 抓取到的第一個就是我們目前選擇的district，因為抓回來是Object，讀取total
        const getSinglePopulation = computed(()=>population.value.filter( element =>element.district == district.value.properties.TOWNNAME)[0].total);
        
        // 桃園市總人口
        const getTotalPopulation = computed(()=> population.value.map(el=>el.total).reduce((a,b)=>a+b));

        // 最高/低人口數
        const max_Population = computed(()=>Math.max(...population.value.map(p => p.total)))
        const min_Population = computed(()=>Math.min(...population.value.map(p => p.total)))

        return {getSinglePopulation, getTotalPopulation, getPercentage, max_Population, min_Population}
    }
}
</script>

<style>

.district_style{
    z-Index: 1002;
}


</style>