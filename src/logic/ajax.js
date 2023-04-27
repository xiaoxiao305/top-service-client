import user from "../logic/user"
class Ajax {
  constructor() {
    this.req = new XMLHttpRequest();
    this.req.responseType = 'text';
    this.host = "http://test.itsmtop.com"
  }

  Get(url) {
    let req = this.req
    return new Promise((resolve, reject) => { 
      req.open("get", this.host + url);
      req.send();
      req.onload = (e) => {
        try {
          let rsp = JSON.parse(e.target.response)
          resolve(rsp)
        } catch (ex) {
          reject(ex)
        }
      }
    })
  }

  Upload(tid, data, type) {
    //data={field:files}   eg:{"A":[image],"B":[xls...]}
    let req = this.req
    return new Promise((resolve, reject) => {
      const form = new FormData()
      form.append("uid", user.id)
      form.append("token", user.token)
      form.append("tid", tid)
      form.append("type", type) //0:模板,1:员工,2:流程
      Object.keys(data).forEach(name => {
        let files = data[name]
        for (let i = 0; i < files.length; i++) {
          form.append(name, files[i], files[i].name)
        }
      })
      req.onload = (e) => {
        console.log("ajax rsp:",e)
        try {
          let rsp = JSON.parse(e.target.response)
          resolve(rsp)
        } catch (ex) {
          reject(ex)
        }
      }
      req.open("POST", this.host + "/upload")
      req.send(form)
    })
  }
}
export default new Ajax();
