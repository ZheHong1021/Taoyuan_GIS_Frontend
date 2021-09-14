<template>
     <div class="card">
        <h5 class="text-2xl font-bold text-center mb-4">{{tourism_prop.data}} ({{tourism_prop.month}})</h5>
        <Chart 
            ref="myChart"
            :type="tourism_prop.type" 
            :data="basicData" 
            :options="basicOptions"
         />
    </div>
</template>

<script>

import Chart from 'primevue/chart';
import { ref, reactive, toRef, onUpdated,  } from "vue";
export default {
    name: 'Tourism_Data',
    components:{
        Chart: Chart,
    },
    props:['tourism_prop'],
    setup(props){
        const myChart = ref();
        const tourism_prop = toRef(props, 'tourism_prop');
        const tourism_data = ref({});

        const get_Tourism_Data = (file, month)=>{
            let income = [];
            let number = [];
            let name = [];
            file.forEach(element => {
                name.push(element.觀光遊憩區別)
                income.push(Number(element.門票收入.replace(/[^0-9.-]+/g,"")))
                number.push(element.遊客人次.replace(/[^0-9.-]+/g,""));
            });
            tourism_data.value[month] = {'觀光遊憩區別': name, '門票收入': income, '遊客人次': number};
        }

        get_Tourism_Data(require('@/assets/tourists_number/July_number.json'), '七月');
        get_Tourism_Data(require('@/assets/tourists_number/June_number.json'), '六月');
        get_Tourism_Data(require('@/assets/tourists_number/May_number.json'), '五月');
        get_Tourism_Data(require('@/assets/tourists_number/April_number.json'), '四月');



        const basicData = reactive( {
                    labels: tourism_data.value[tourism_prop.value.month].觀光遊憩區別,
                    datasets: [
                        {
                            label: "門票收入" , // 預設
                            backgroundColor: '#42A5F5',
                            data: tourism_data.value[tourism_prop.value.month].門票收入 // 預設
                        },
                    ]
                }
        )

        const basicOptions = reactive( {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                
            }
        })

        onUpdated(()=>{
            let month = tourism_prop.value.month; // 月份
            let data = tourism_prop.value.data; // 門票收入 or 旅客人次
            myChart.value.data.label = data;
            myChart.value.data.datasets[0].label = data;
            myChart.value.data.datasets[0].data = tourism_data.value[month][data];
            
            myChart.value.chart.update();
            console.log(myChart.value);
        })


        return { myChart, basicData, basicOptions, tourism_data, };
    }
}
</script>

<style>

</style>