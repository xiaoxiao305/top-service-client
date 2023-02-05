<template>
  <!-- 模板功能 编辑数据 -->
    <div> 
      <div v-for="(model,i) in items" :key="i"   class="component" >
        <b>{{model.name}}</b>
        <Input v-if="model.ui==1" :placeholder="model.placeholder" v-model="model.value" style="width: auto"/>
        <Input v-if="model.ui==2" :placeholder="model.placeholder" v-model="model.value" style="width: auto"/>
        <RadioGroup v-if="model.ui==3" v-model="model.value">
          <Radio v-for="(ra,r) in model.options" :label="ra.label" :key="r">{{ ra.value }}</Radio>
        </RadioGroup>
        <CheckboxGroup v-if="model.ui==4" v-model="model.value">
          <Checkbox v-for="(ra,r) in model.options" :label="ra.value" :key="r">{{ ra.value }}</Checkbox>
        </CheckboxGroup>
        <Select v-if="model.ui==5" v-model="model.value">
          <Option v-for="(ra,r) in model.options" :label="ra.value" :key="r">{{ ra.value }}</Option>
        </Select>
        <TimePicker  v-if="model.ui==6" v-model="model.value"></TimePicker>
        <DatePicker v-if="model.ui==7" v-model="model.value"></DatePicker>
        <Rate v-if="model.ui==8" v-model="model.value"></Rate>
        <i-Switch v-if="model.ui==9" v-model="model.value"></i-Switch> 
      </div> 
        <Button type="primary" @click="saveData">保存</Button>
    </div>
  </template>
  <script>
    import code from "../logic/code";
    import proto from "../logic/proto";
    import widget from "../logic/widget";
    export default {
      name: "ui-data",
      props:['menu','setTab','loadData'],
      data(){
        return{ 
          items:[]
        }
      }, 
      watch:{ 
        'menu': {
          handler: function (newVal, oldVal) {
            console.log("menu newVal:",newVal)
            this.loadTemplates()
          },
          deep: true
        },
      },
      methods:{  
        saveData () { 
          let dbTemplates=widget.getdbTemplates(this.items);
          let templateData={};
          dbTemplates.map(m=>{ 
            templateData[m['f']]=m['v']; 
          })
          this.$ws.addFunc(proto.EditTemplateDataRsp, function (rsp) {
            if (rsp.code === code.OK) {
              this.$Message.info("保存成功");
              //暂定  员工扩展信息
              let list=store["userInfo"]?JSON.parse(store["userInfo"]):{}
              list[rsp.id]=JSON.stringify(templateData)
              store["userInfo"]=JSON.stringify(list)
              console.log("userinfo store:",store["userInfo"])
              // this.loadData(this.menu.tid);
              // this.setTab({id:this.menu.id,tid:this.menu.tid,type:0});//组装父级tid对象
            } else {
              this.$Message.error(code.Message(rsp.code))
            }
          }, this)
          this.$ws.call(proto.EditTemplateData,this.menu.did?this.menu.did:0,this.menu.tid,JSON.stringify(templateData));
        }, 
        async loadTemplates(){
          if(!this.menu ||!this.menu.tid|| this.menu.tid<1)return;
          let dbTemplates=await widget.loadTemplateInfo(this.menu.tid);
          if(!dbTemplates || !dbTemplates.data || dbTemplates.data.length<1)return;
          this.items=widget.getUITemplates(dbTemplates.data,true);
        },
        async loadDataInfo(){
          let ds=await widget.loadTemplateData(this.menu.tid,1,10)
          ds.map(m=>{
            if(m.id==this.menu.did){
              this.items.map(mi=>{
                for(let k in m){
                if(mi.filed.toUpperCase()==k.toUpperCase()){
                  mi.value=m[k];
                  return mi;
                }
                } 
              })
            }
          })
        }
      },
      created(){ 
        console.log("data created")
        this.loadTemplates();
        if(this.menu.did>0)
          this.loadDataInfo();
      }
    }
    </script> 
  <style scoped>
  .component{margin-top:8px;border: 1px solid #ccc;border-radius: 3px;padding: 8px 0;}
  .component b{height:40px;line-height:40px;padding-left: 8px;padding-right: 8px;}
  .component input,select,textarea,option,label{height:40px;line-height: 40px;width: auto;}
  </style>