import jsSHA from "jssha"

export default function useAuthHeader() {
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