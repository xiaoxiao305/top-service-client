import proto from "./proto"
import user from "../logic/user"
const host="ws://test.itsmtop.com/ws" //test.itsmtop.com
// const host="ws://127.0.0.1:12345/ws" //test.itsmtop.com
function utf8ArrayToStr(array) {
  let out, i, c, char2, char3;
  out = "";
  i = 0;
  while (i < array.length) {
    c = array[i++];
    switch (c >> 4) {
      case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:
        out += String.fromCharCode(c);
        break;
      case 12:case 13:
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
        break;
    }
  }
  return out;
}

class Socket {
  constructor() {
    this.methods = {};
    this.connected = false;
    this.authorized=false
    this.init()
  }
  otherLogin(){
    window.location.href="/login"
    session.clear()
    user.account=""
    user.token=""
    alert("账号在别处登录")
  }
  init() {
    this.addFunc(proto.OtherLogin,this.otherLogin)
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(host)
      this.ws.binaryType = "arraybuffer"
      this.ws.onopen = (e => {
        this.connected = true
        resolve(e)
      })
      this.ws.onmessage = (e => {
        this.onmessage(e)
      })
      this.ws.onerror = (e => {
        let path = window.location.href.split("/").slice(-1)[0].split("?")[0]
        this.connected = false
        if (path === "login") {
          reject(e)
          reject = null
        } else {
          alert("与服务器的连接已断开,请与管理员联系")
          window.location.href = "/login"
        }
      })
      this.ws.onclose = (e) => {
        this.connected = false
        let path = window.location.href.split("/").slice(-1)[0].split("?")[0]
        if (reject) {
          path === "login" ? reject(e) : window.location.href = "/login"
        }
      }
    })
  }
  onmessage(e){
    let data= utf8ArrayToStr(new Uint8Array(e.data))
    if (window.DEBUG){
      console.log("socket.Receive:",data)
    }
    let msg = JSON.parse(data)
    let fn = this.methods[msg.id];
    if (!fn) {
      if (window.DEBUG) {
        console.error("not found function:", msg.id, "args:", msg);
      }
      return
    }
    fn[0].apply(fn[1], msg.args);
  }
  call(){
    if (arguments.length < 1) {
      console.error("参数格式不正确:call args is null");
      return
    }
    let args = [];
    for (let i = 1; i < arguments.length; i++) args.push(arguments[i]);
    this.send(arguments[0], args);
  }
  send(id,args){
    if (!this.connected) {
      console.error("与服务器的连接已断开:", id, args);
      return
    }
    let data = {id:id,args:args};
    if (window.DEBUG){
      console.info("ws.send:",data)
    }
    this.ws.send(JSON.stringify(data));
  }
  addFunc(id,fn,target){
    if (!target) target = this;
    this.methods[id] = [fn, target]
  }
  logout(){
    this.ws.close()
  }
  //主动退出
  exit(){
    session.clear()
    this.ws.close()
  }
}
export default Socket
