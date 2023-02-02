  
    import proto from "../logic/proto"
    import code from "../logic/code"
    import Vue from 'vue'
    import cc from '@/logic/componentsconfig'
    export default { 
        loadTemplateInfo(tid){
            return new Promise((resolve, reject) => {
                Vue.prototype.$ws.call(proto.TemplateInfo,parseInt(tid)); 
                Vue.prototype.$ws.addFunc(proto.TemplateInfoRsp, function (rsp) {
                    if (rsp.code === code.OK) { 
                        let dbTemplates={};
                        if(rsp.data && rsp.data.length>0)
                            dbTemplates={data:JSON.parse(rsp.data),index:rsp.index,tid:rsp.tid};
                        resolve(dbTemplates);
                    } else {
                        reject(rsp.code);
                    }
                }, this)
            }).catch(function(err){})
        }, 
        loadTemplateData(tid,page,size){
            return new Promise((resolve, reject) => {
                Vue.prototype.$ws.call(proto.TemplateData,parseInt(tid),page,size); 
                Vue.prototype.$ws.addFunc(proto.TemplateDataRsp, function (rsp) {
                    if (rsp.code === code.OK) { 
                        let newData=[];
                        let rspD={}
                        for(let i=0;i<rsp.data.length;i++){
                            rspD=JSON.parse(rsp.data[i]);
                            rspD.id=rsp.id[i];
                            newData.push(rspD)
                        }
                        resolve(newData);
                    } else {
                    reject(rsp.code);
                    }
                }, this)
            })
        },
//filed:ui=>db
getdbTemplates(uiTemplates){
    let dbTemplates=[];
    let m={};
    uiTemplates.forEach(i=>{
        m={};
        for(let f in cc.dbTemplateFiled){
            if(i.hasOwnProperty(f))
                m[cc.dbTemplateFiled[f]]=i[f];
        }
        dbTemplates.push(m); 
    })
    return dbTemplates;
  }, 
//filed:db=>ui
getUITemplates(dbTemplates,isHaveVal){
    if(!dbTemplates || dbTemplates.length<1)return;
    let uiTemplate={};
    let uiTemplates=[];
    dbTemplates.forEach(d=>{
        uiTemplate=isHaveVal?{value:d.d}:{};
        for(let f in cc.dbTemplateFiled){
            if(d.hasOwnProperty(cc.dbTemplateFiled[f]))//ui f p d 
                uiTemplate[f]=d[cc.dbTemplateFiled[f]];
        } 
        uiTemplates.push(uiTemplate);
    }) 
    return uiTemplates;
},  
}