import L from 'leaflet'
/*---------------geoJSON設定---------------*/

// 來顯現 marker座標點
export const  onEachFeature =(feature, layer)=>{
    // 再透過 makePopupContent將從JSON中的資料內容用在 Popup中
    layer.bindPopup(makePopupContent(feature), {
  
      // 將 popup右上角的 X給去除掉
      closeButton: false,
  
      // 不要讓 popup遮住marker的ICON
      offset: L.point(0, -8)
    });
  }
  
  
// // 利用 geoJSON將從 ajax的資料來 popup到 marker座標中來呈現資料
function  makePopupContent (station){
    let return_html =     
    `<div>
    <h2>${station.properties.name}</h2>
    `
    return return_html;
}