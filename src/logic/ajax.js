class Ajax {
  constructor() {
    this.req = new XMLHttpRequest();
    this.req.responseType = 'text';
     this.host="http://test.itsmtop.com"
  }
  Get(url) {
    let req=this.req
    return new Promise((resolve, reject) => {
      req.open("get", this.host+url);
      req.send();
      req.onload=(e)=>{
        try {
          let rsp = JSON.parse(e.target.response)
          resolve(rsp)
        }catch(ex) {
          reject(ex)
        }
      }
    })
  }
}

export default new Ajax();
