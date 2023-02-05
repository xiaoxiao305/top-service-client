  
    import proto from "../logic/proto"
    import code from "../logic/code"
    import Vue from 'vue'
    import cc from '@/logic/componentsconfig'
    
const dbTemplateFiled={
    "id":"id",
    "type":"t",// ui-type   1 input ,2 text,3 radio,4 checkbox,5 select,6 time,7 date
    //8 rate,9 switch 
    "name":"n",//   n:"姓名",//中文名称
    // "filed":"f",//   f:""  //字段名
    "value":"v",// v:""//值
    "placeholder":"p", //   p:"" //占位符
    "defaultValue":"d",//   d:"" //默认值
    "options":"op", //选项
    "isRange":"r",//   r:0|1, 是否是范围【日期、时间】
    // "size":"s",//   s:[w,h] //图片
    // "fileType":"fi",//   fi：“*.png|jpg”
    // "Multiple":"m",//   m:1 //允许多张
    "pops":"ps"//行列布局
  }
    export default { 
        loadTemplateInfo(tid){
            return new Promise((resolve, reject) => {
                Vue.prototype.$ws.call(proto.TemplateInfo,tid); 
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
        loadTemplateInfo2(rsp){
            if (rsp.code === code.OK) { 
                let dbTemplates={};
                if(rsp.data && rsp.data.length>0)
                    dbTemplates={data:JSON.parse(rsp.data),index:rsp.index,tid:rsp.tid};
                return dbTemplates;
            }
        }, 
        loadTemplateData(tid,page,size){
            return new Promise((resolve, reject) => {
                Vue.prototype.$ws.call(proto.TemplateData,tid,page,size); 
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
getdbTemplates2(uiTemplates){    
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
    console.log("getdbTemplates2:",dbTemplates)
    return dbTemplates;
  }, 
getdbTemplates(uiTemplates){
    let dbTemplates=[];
    let m={};
    uiTemplates.forEach(i=>{
        m={};
        for(let f in dbTemplateFiled){
            if(i.hasOwnProperty(f))
                m[dbTemplateFiled[f]]=i[f];
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