let session=sessionStorage
class User {
  constructor() {
    this.token = session["reconnect-token"] || "" //断线重连的token
    this.account=session["account"]||""
    this.com="企业信息&流程管理平台"
    this.name=""
    this.logo="../static/logo.png"
  }
  setInfo(info) {
    session["user-info"] = info
    session["reconnect-token"]=info.token
    session["account"]=info.account
    info.com=info.com||"企业信息&流程管理平台"
    info.logo=info.logo||"/static/logo.png"
    Object.assign(this,info)
  }
}
let user=new User()
export default user
