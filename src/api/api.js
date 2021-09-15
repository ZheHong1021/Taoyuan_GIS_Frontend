import axios from 'axios';
import jsSHA from "jssha"

function useAuthHeader() {
  var AppID = 'e32637236ea242abb50177076c6c00c6';
  var AppKey = 'qiXPXVC8HDrd4e0OCGH3X8l2tlY';

  var GMTString = new Date().toGMTString();
  var ShaObj = new jsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(AppKey, 'TEXT');
  ShaObj.update('x-date: ' + GMTString);
  var HMAC = ShaObj.getHMAC('B64');
  var Authorization = `hmac username="${AppID}", algorithm="hmac-sha1", headers="x-date", signature="${HMAC}"`;

  return {
    'Authorization': Authorization,
    'X-Date': GMTString, /*,'Accept-Encoding': 'gzip'*/
  }; 
}

const PTX_Train_Station = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/Station',
    headers: useAuthHeader()
});
const PTX_Thsr_Station = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Rail/THSR/Station',
    headers: useAuthHeader()
});

const PTX_Train_ODfare = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v3/Rail/TRA/ODFare',
    headers: useAuthHeader()
})

const PTX_Thsr_ODfare = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Rail/THSR/ODFare',
    headers: useAuthHeader()
})

const PTX_Train_TimeTable = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/OD',
    headers: useAuthHeader()
})

const PTX_Thsr_TimeTable = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Rail/THSR/DailyTimetable/OD',
    headers: useAuthHeader()
})

const PTX_Bus_Route = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Bus/Route/City',
    headers: useAuthHeader()
})

const PTX_Bus_StopOfRoute = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City',
    headers: useAuthHeader()
})

// 這個可以以線性(Leanerly)方式來顯示該路線所有的站序(臺北市、 臺南市、 新北市、 桃園市、 臺中市)
const PTX_Bus_DisplayStopOfRoute = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Bus/DisplayStopOfRoute/City',
    headers: useAuthHeader()
})

const PTX_Bus_EstimatedTimeOfArrival = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City',
    headers: useAuthHeader()
})

const PTX_Bus_RealTimeByFrequency = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/',
    headers: useAuthHeader()
})

const PTX_Bus_RealTimeNearStop = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeNearStop/City/',
    headers: useAuthHeader()
})




// 得到台鐵的站點資訊(使用到的位置: /components/TrainStation)
export const get_Train_Station = () => PTX_Train_Station.get(`/`);

// 得到高鐵的站點資訊(使用到的位置: /components/ThsrStation)
export const get_Thsr_Station = () => PTX_Thsr_Station.get(`/`);

// 得到台鐵的票價資訊(使用到的位置: /views/TRA)
export const get_Train_Odfare = (data) => PTX_Train_ODfare.get(`/${data.OriginStationID}/to/${data.DestinationStationID }?$format=JSON`);

// 得到高鐵的票價資訊(使用到的位置: /views/THSR)
export const get_Thsr_Odfare = (data) => PTX_Thsr_ODfare.get(`/${data.OriginStationID}/to/${data.DestinationStationID }?$format=JSON`);

// 得到台鐵的時刻表(使用到的位置: /views/TRA)
export const get_Train_TimeTable = (data) => PTX_Train_TimeTable.get(`/${data.OriginStationID}/to/${data.DestinationStationID}/${data.choose_Date}?$format=JSON`);

// 得到高鐵的時刻表(使用到的位置: /views/THSR)
export const get_Thsr_TimeTable = (data) => PTX_Thsr_TimeTable.get(`/${data.OriginStationID}/to/${data.DestinationStationID}/${data.choose_Date}?$format=JSON`);

// 得到公車路線資訊(使用到的位置: /views/Bus)
const select_Bus_Route = 'RouteUID, RouteName, SubRoutes, BusRouteType, DepartureStopNameZh, DestinationStopNameZh';
export const get_Bus_Route = (data) => PTX_Bus_Route.get(`/${data}?$format=JSON&$select=${select_Bus_Route}`);

// 得到公車路線上的各個站點(使用到的位置: /views/Bus)
const select_Bus_StopOfRoute = 'Direction, Stops';
export const get_Bus_StopOfRoute = (data) => PTX_Bus_StopOfRoute.get(`/${data.city}?$format=JSON&$select=${select_Bus_StopOfRoute}&$filter=RouteUID eq '${data.routeUID}'`);

// 得到公車路線上的各個站點(使用到的位置: /views/Bus)
const select_Bus_DisplayStopOfRoute = 'Direction, Stops';
export const get_Bus_DisplayStopOfRoute = (data) => PTX_Bus_DisplayStopOfRoute.get(`/${data.city}?$format=JSON&$select=${select_Bus_DisplayStopOfRoute}&$filter=RouteUID eq '${data.routeUID}'`);

// 得到公車路線上的到站估計時間(使用到的位置: /views/Bus)
const select_Bus_EstimatedTimeOfArrival = 'StopUID, Direction, PlateNumb, EstimateTime, NextBusTime, StopName';
export const get_Bus_EstimatedTimeOfArrival = (data) => PTX_Bus_EstimatedTimeOfArrival.get(`/${data.city}?$format=JSON&$select=${select_Bus_EstimatedTimeOfArrival}&$filter=RouteUID eq '${data.routeUID}'`);


// 得到目前公車在地圖上哪個位置(使用到的位置: /views/Bus)
const select_Bus_RealTimeByFrequency = 'PlateNumb, Direction, BusPosition, DutyStatus';
export const get_Bus_RealTimeByFrequency = (data) => PTX_Bus_RealTimeByFrequency.get(`/${data.city}?$format=JSON&$select=${select_Bus_RealTimeByFrequency}&$filter=RouteUID eq '${data.routeUID}' AND DutyStatus eq 1`);

// 得到目前公車在哪個站點(使用到的位置: /views/Bus)
const select_Bus_RealTimeNearStop = 'Direction, StopName, PlateNumb, DutyStatus, StopUID';
export const get_Bus_RealTimeNearStop = (data) => PTX_Bus_RealTimeNearStop.get(`/${data.city}?$format=JSON&$select=${select_Bus_RealTimeNearStop}&$filter=RouteUID eq '${data.routeUID}' AND DutyStatus eq 1`);


const PTX_Taoyuan_BusStop = axios.create({
    baseURL: 'https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/Taoyuan/',
    headers: useAuthHeader()
})

// 得到目前公車在哪個站點(使用到的位置: /views/Bus)
const select_Taoyuan_BusStop = 'StopName, StopPosition';
export const get_Taoyuan_BusStop = () => PTX_Taoyuan_BusStop.get(`?$format=JSON&$select=${select_Taoyuan_BusStop}`);
