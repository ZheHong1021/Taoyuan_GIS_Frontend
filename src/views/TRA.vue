<template>

    <section class="flex flex-col w-full items-center">
      <h1 class="text-center text-3xl font-bold my-2">台鐵資訊查詢</h1>
      <form 
        class="flex flex-col w-full items-center"  
        @submit.prevent='Search_Info'>
          <div class="w-1/2 my-4">
            <h1 class="text-xl font-bold w-full flex justify-between">
              起站點
              <small class="text-red-500 text-right" v-if="info.origin_Station_id === '' && is_Search">
                ★ 請確實填寫
              </small>
            </h1>
              <Dropdown 
                class="w-full"
                :class="(info.origin_Station_id === '' && is_Search) ? 'is_empty' : ''"
                :filter="true"
                filterPlaceholder="選擇車站"
                v-model="info.origin_Station_id" 
                :options="$store.state.module_Station.new_train" 
                optionLabel="name" 
                optionValue="id"
                optionGroupLabel="city" 
                optionGroupChildren="station"
                emptyFilterMessage="找不到該車站，請重新搜尋"
                placeholder="選擇起站點">
                  
                  <template #optiongroup="slotProps">
                      <div class="text-red-500 text-lg font-bold">
                        <i class="fas fa-subway"></i>
                        {{slotProps.option.city}}
                        </div>
                  </template>
              </Dropdown>
             



          </div>
          <div class="w-1/2 my-4">
            <h1 class="text-xl font-bold w-full flex justify-between">
              迄站點
              <small class="text-red-500 text-right" v-if="info.destinate_Station_id === '' && is_Search">
                ★ 請確實填寫
              </small>
            </h1>
              <Dropdown 
                class="w-full"
                :class="(info.destinate_Station_id === '' && is_Search) ? 'is_empty' : ''"
                :filter="true"
                filterPlaceholder="選擇車站"
                v-model="info.destinate_Station_id" 
                :options="$store.state.module_Station.new_train" 
                 optionLabel="name" 
                optionValue="id"
                optionGroupLabel="city" 
                optionGroupChildren="station"
                emptyFilterMessage="找不到該車站，請重新搜尋"
                placeholder="選擇迄站點" >
                  <template #optiongroup="slotProps">
                      <div class="text-red-500 text-lg font-bold">
                        <i class="fas fa-subway"></i>
                        {{slotProps.option.city}}
                        </div>
                  </template>
              </Dropdown>
          </div>


          <div class="w-1/2 my-4">
            <h1 class="text-xl font-bold w-full flex justify-between">
                日期
                <small class="text-red-500 text-right" v-if="info.choose_Date === '' && is_Search">
                  ★ 請確實填寫
                </small>
              </h1>
            <Calendar 
                class="w-full" 
                :showIcon= "true" 
                :showButtonBar="true" 
                dateFormat="yy.mm.dd" 
                v-model="info.choose_Date"
                @date-select = "dateSelect"
                />
          </div>


          <div class="w-1/2 my-4">
            <Button 
                type="submit" 
                label="Search" 
                icon="pi pi-search" 
                iconPos="right" 
                class="p-button-text p-button-text w-full text-lg py-2 px-4 font-semibold rounded-lg shadow-md" 
                :loading="isLoading" />
          </div>
      </form>

    <!-- 發現API沒抓到資料，代表並無行駛兩站之間的列車 -->
    <div class="text-lg font-bold" v-if="is_Search === true && isLoading === false && (object_isEmpty(result.timeTable) || object_isEmpty(result.odfare))">查無資料</div>
    <div class="text-lg font-bold" v-else-if="isLoading === true">載入中...</div>
    <div class="text-lg font-bold" v-else>歡迎查詢~!!</div>

    <!-- Dialog -->
    <Dialog 
    v-if="isLoading === false && !object_isEmpty(result.timeTable)"
    v-model:visible="is_ShowDialog" 
    :breakpoints="{'960px': '75vw', '640px': '100vw'}" 
    :style="{width: '50vw'}">
        <!-- Header -->
         <template #header>
          <h3 class="text-lg font-bold">
              {{ info.choose_Date }} 
              {{ result.timeTable[0].OriginStopTime.StationName.Zh_tw }}
              <i class="fas fa-arrow-circle-right"></i>
              {{ result.timeTable[0].DestinationStopTime.StationName.Zh_tw }} 
          </h3>
        </template>
      
      <!-- Body -->
        <div class="w-full">
        <DataTable :value="result.timeTable" :paginator="true" :rows="10"
              :pageLinkSize = 4
              currentPageReportTemplate="目前顯示 {first} / {last} ，總車班數量: {totalRecords}"
              paginatorTemplate="CurrentPageReport PrevPageLink PageLinks NextPageLink"
              responsiveLayout="scroll"
          >
            <Column header="車次編號">
              <template #body="slotProps">
                  <h1>{{slotProps.data.DailyTrainInfo.TrainNo}}</h1>
                <!-- 透過下面所定義的reactive來去抓取相對應的車種名稱 -->
                  <h1>{{ Odfare_Info.trainType[slotProps.data.DailyTrainInfo.TrainTypeCode] }}</h1>
              </template>
            </Column>

            <Column field="OriginStopTime.DepartureTime" header="出發時間"></Column>
            <Column field="DestinationStopTime.ArrivalTime" header="到站時間"></Column>

            <Column header="行駛時間">
                <template #body="slotProps">
                  <h1>{{ diff_DriveTime(slotProps.data.OriginStopTime.DepartureTime, slotProps.data.DestinationStopTime.ArrivalTime) }}</h1>                  
                </template>
            </Column>

            <Column header="車票價格">
                <template #body="slotProps">
                     <div v-for="(item, index) in search_Odfare(slotProps.data.DailyTrainInfo.Direction,slotProps.data.DailyTrainInfo.TrainTypeCode)" :key="index">
                       <span>{{ Odfare_Info.FareClass[item.FareClass] }}票: {{item.Price}}</span>
                     </div>
                </template>
            </Column>

        </DataTable>    
      </div>

    </Dialog>


      </section>

</template>
<script>
import {onMounted, reactive, ref} from '@vue/runtime-core'
import { useStore } from 'vuex' // Composition API
import { get_Train_Station, get_Train_Odfare, get_Train_TimeTable } from "../api/api.js"; 
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';

export default {
   components: {
     Dropdown: Dropdown,
     Button: Button,
    Calendar: Calendar,
    DataTable: DataTable,
    Column: Column,
    Dialog: Dialog,
    },

    setup(){
      const store = useStore()
      const info = reactive({
        'origin_Station_id' : "",
        'destinate_Station_id' : "",
        'choose_Date': "",
      });
      const result = reactive({
        odfare: {},
        timeTable: {},
      })

      const Odfare_Info = reactive({
        trainType: {1: '太魯閣', 2: '普悠瑪', 3: '自強', 4: '莒光', 5: '復興', 6: '區間', 7: '普快', 10: '區間快'},
        FareClass: {1: '成人', 2: '學生', 3: '孩童', 4: '敬老', 5: '愛心', 6: '愛心孩童', 7: '愛心優待/愛心陪伴', 8: '團體', 9: '軍警'},
      }) 

      const isLoading = ref(false)
      const is_Search = ref(false) // 是否查詢
      const is_ShowDialog = ref(false)

      // OverlayPanel
      const overlay_panel = ref();

    // 讀取 API
    onMounted(async ()=>{
      await get_Train_Station().then((res)=>{
        store.commit('module_Station/setTrainStation', res.data)
        }).catch((err)=>{
          console.log('連線異常:' + err);
        });

      // 如果 store的 new_arr是空的話，則透過 commit去更新(新增)
      // 下次進入該 page時，則不會再執行該下方指令
      const is_Arr_empty = store.getters['module_Station/get_NewTrainArr_Length']
      if(is_Arr_empty){
        setTimeout(() => {
            store.commit('module_Station/setNewStation', 'train');
        }, 1500);
      }
    })

    const Search_Info = async ()=>{
      // 確定是否點擊查詢
      is_Search.value = true

      if(info.origin_Station_id !== '' && info.destinate_Station_id !== '' && info.choose_Date !== ''){
        //  傳送起站、迄站的ID給 API(透過 Promise.all將 多個API同時執行)
        Promise.all([
          get_Train_Odfare({
              OriginStationID : info.origin_Station_id, 
              DestinationStationID : info.destinate_Station_id,
          }),
          get_Train_TimeTable({
              OriginStationID : info.origin_Station_id, 
              DestinationStationID : info.destinate_Station_id,
              choose_Date: info.choose_Date})
        ])
        .then( (response) => {
            result.odfare = response[0].data.ODFares;
            result.timeTable = response[1].data;
        })

          //  Loading Animation
          isLoading.value = true
          if( result.odfare && result.timeTable ){
            setTimeout(() => {
              // 載入成功後，關閉載入動畫並開啟 Dialog
              isLoading.value = false
              is_ShowDialog.value = true
            }, 1000);

          }
      }
    }

     const dateSelect = (date)=>{
      const new_date = new Date(date);
      const year = new_date.getFullYear()
      // 月份跟日期必須以 [mm-dd]的方式呈現
      const month = (new_date.getMonth() + 1) < 10 ? `0${new_date.getMonth() + 1}` : new_date.getMonth() + 1;
      const day = (new_date.getDate()) < 10 ? `0${new_date.getDate()}` : new_date.getDate();
      info.choose_Date = `${year}-${month}-${day}`
    }


    const object_isEmpty = (object)=>{
      if (Object.keys(object).length === 0) {
          return true // 如果為空,返回true
      }
      return false // 如果不為空，則會執行到這一步，返回false
    }


    const diff_DriveTime = (O_Time, D_Time)=>{
      const _startTime = O_Time.split(":");
      const _endTime = D_Time.split(":");
      let startDate = new Date(0, 0, 0, _startTime[0], _startTime[1], 0);
      let EndDate = new Date(0, 0, 0, _endTime[0], _endTime[1], 0);
      EndDate.setHours(EndDate.getHours() - startDate.getHours());
      EndDate.setMinutes(EndDate.getMinutes() - startDate.getMinutes());
      return EndDate.getHours() + "小時" + EndDate.getMinutes() + "分鐘";
    }


    const toggle = (event)=> {
      overlay_panel.value.toggle(event);
    }


    const search_Odfare = (Direction, TrainType)=>{
      let return_Fare = []
      Object.keys(result.odfare).forEach((key) => {
          const odfare_Direct = result.odfare[key].Direction
          const odfare_TrainType = result.odfare[key].TrainType
          if(odfare_Direct == Direction && odfare_TrainType == TrainType){
            return_Fare = result.odfare[key].Fares
          }
      });

      return return_Fare
    }


    // Composition API Return
      return {
        info, result, Odfare_Info, is_ShowDialog, is_Search, isLoading, overlay_panel,
        toggle, object_isEmpty, Search_Info, dateSelect, diff_DriveTime, search_Odfare
      }
    }
}



</script>

<style scoped>
  .is_empty{
    border: 2px solid red;
  }
</style>