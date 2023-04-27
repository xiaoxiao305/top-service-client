import Vue from "vue"
import proto from "../logic/proto"
import code from "../logic/code"
class Data{
    constructor(){
        this.$ws=Vue.prototype.$ws
    }
   
    SetCache( key , value){
    key=key.ToLowerCase()
    localStorage.setItem(key,value)
}
    GetCache(key){
        key=key.ToLowerCase()
        return localStorage.getItem(key)
    } 
    async GetOrganizationList(){
        var res;
        console.log("GetOrganizationList 11:")
       res= await this.PromiseRsp(proto.OrganizationsRsp)
        console.log("data js success2:",res)
        this.$ws.call(proto.Organizations) 
        return res
    }
    PromiseRsp(any){
        return new Promise((resolve,reject)=>{
            this.$ws.addFunc(any,function(rsp){
                console.log("data js success:",rsp)
                resolve(rsp) 
            },this)
		})
    }
}
export default new Data()