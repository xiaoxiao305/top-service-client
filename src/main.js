// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import md5 from "js-md5"
import 'iview/dist/styles/iview.css'
import VueI18n from "vue-i18n/dist/vue-i18n"
Vue.use(VueI18n)

import iView from 'iview';
Vue.use(iView)
//Vue.locale = () => {};
import languages from "./lang/default"
const i18n = new VueI18n({locale: 'zh',messages:languages});

Vue.config.productionTip = false
window.session=sessionStorage;
window.store=localStorage;
window.DEBUG=true;
/* eslint-disable no-new */
Vue.prototype.addSocket=function (socket){
  Vue.prototype.call = socket.call
  Vue.prototype.addFunc = socket.addFunc
  Vue.prototype.$ws = socket
}
new Vue({
  el: '#app',
  router,
  i18n,
  components: { App },
  template: '<App/>'
})
Date.prototype.format=function(fmt) {
  if (isNaN(this.getFullYear())){return ""}
  let o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (let k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};
Date.prototype.Unix=function (){return Math.floor(this.getTime()/1000)}
Date.prototype.toLocal=function() {return this.format("yyyy/MM/dd hh:mm:ss")}
Array.prototype.remove=function (item) {
  let idx = this.indexOf(item);
  if (idx > -1) {
    this.splice(idx, 1)
  }
}
Array.prototype.insert = function(index, value){this.splice(index,0, value);}
Array.prototype.move=function (index,origin){
  this.splice(index,0,this.splice(origin,1)[0])
}
//返回 min（包含）～ max（包含）之间的数字
window.random=function(){
  let min=0,max=~(1 << 31)
  if (arguments.length===1){
    max=arguments[0]
  }else if (arguments.length===2){
    min=arguments[0]
    max=arguments[1]
  }
  return Math.floor(Math.random() * (max - min + 1) ) + min
}
window.device={
  code(){
    let  canvas = document.createElement("canvas")
    let ctx = canvas.getContext("2d");
    let colors=["rgb(192, 80, 77)","rgb(155, 187, 89)","rgb(128, 100, 162)"]
    let points=[[70,45],[45,95],[95,95]]
    for(let i=0;i<3;i++){
      ctx.beginPath();
      ctx.fillStyle =colors[i];
      ctx.arc(points[i][0], points[i][1], 35, 0, Math.PI*2, false);
      ctx.fill();
      ctx.font="30px Arial";
      ctx.strokeText(i.toString(),points[i][0]-10,points[i][1]+10);
    }
    //00000000-0000-0000-0000-000000000000
    let value=md5(canvas.toDataURL("image/jpeg")).toString()
    return value.slice(0,8)+"-"+value.slice(8,12)+"-"+value.slice(12,16)+"-"+value.slice(16,20)+"-"+value.slice(20)
  },
  uuid(){
    let info=window.clientInformation
    let fingerprint= {
      client: {
        appCodeName:info.appCodeName,
        appName: info.appName,
        appVersion: info.appVersion,
        hardwareConcurrency:info.hardwareConcurrency,
        language:info.language,
        maxTouchPoints:info.maxTouchPoints,
        mimeTypes:[],
        pdfViewerEnabled:info.pdfViewerEnabled,
        platform: info.platform,
        product: info.product,
        productSub: info.productSub,
        userAgent:info.userAgent,
        userAgentData:info.userAgentData,
        vendor: info.vendor,
        vendorSub: info.vendorSub
      },
      mojo: {},
      screen:{ah:screen.availHeight,al:screen.availLeft,at:screen.availTop,aw:screen.availWidth,cd:screen.colorDepth,h:screen.height,pd:screen.pixelDepth,w:screen.width},
      browser:{},
      plugins:[],
    }
    if(window.chrome){
      fingerprint.browser=JSON.stringify(window.chrome)
    }
    if (window.mojo && window.mojo.interfaceControl){
      fingerprint.mojo={id:window.mojo.interfaceControl.RUN_MESSAGE_ID,pipe:window.mojo.interfaceControl.RUN_OR_CLOSE_PIPE_MESSAGE_ID}
    }
    let client=fingerprint.client
    info.mimeTypes.forEach((mime)=>{
      client.mimeTypes.push([mime.type,mime.suffixes,mime.description])
    })
    info.plugins.forEach((p)=>{fingerprint.plugins.push([p.name,p.filename,p.description])})
    return md5(JSON.stringify(fingerprint)).toString()+md5(this.code()).toString()
  },
}
window.domain=function() {
  return "test"
  let host = window.location.host.split('.')
  if (host.length !== 3) {
    return ""
  }
  return host[0]
}
// 将52进制的数字转换为10进制数字
String.prototype.toDecimal=function (){
  if (this === "") {
    return 0
  }
  let abs =this
  if (this[0] === '-') {
    abs =abs.replace("-","")
  }
  let number=0
  let digits="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  for (let i = 0; i < abs.length; i++) {
    let index =digits.indexOf(abs[i])
    number += index * Math.pow(52, abs.length-1-i)
  }
  if (this[0] === '-'){
    return -number
  }
  return number
}
Number.prototype.toNumber52=function (){
  let abs=Math.abs(this)
  let digits="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  let number=""
  while (abs !== 0) {
    number = digits[abs % 52] + number
    abs = Math.floor(abs / 52)
  }
  if (this<0){
    return "-"+number
  }
  if (number==='')number="A"
  return number
}
