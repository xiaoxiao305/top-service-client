<template>
    <!-- 系统设置 预设数据源 -->
    <div>
        <Button @click="showModal=true" type="primary" style="width:100px;">添加数据</Button>
        <Table :columns="columns" :data="data"></Table>
        <Modal
            v-model="showModal" 
            title="添加基础数据"
        >
            标签：<Input v-model="modal.name" placeholder="请输入数据源名称" style="width:40%;"></Input>
            <li v-for="(item,index) in modal.options" :key="index"  style="line-height:40px;width:100%;">
            值 {{ index }}：<Input v-model="modal.options[index]" style="width:40%;margin-right: 5px;"></Input >
            <i class="drag-item" style="font-size: 16px;margin: 0 5px;cursor: move;"><i class="iconfont icon-icon_bars"></i></i>
            <Button icon="md-remove"  @click="removeOptions(index)" circle plain  style="padding: 4px;margin-left: 5px;" ></Button>
            </li>
            <b @click="addOption" style="color:dodgerblue;cursor: pointer;">添加选项</b>
            <div slot="footer">
                <Button type="primary" @click="editBaseData">确定</Button>
            </div>
        </Modal>

    </div> 
  </template>
  <script> 
    import proto from "../logic/proto"
    import code from "../logic/code"
     export default {
       name: "SettingData",
       data() {
         return { 
            modal:{name:'',options:[]},showModal:false,
            columns: [{title:"ID",key:"id"},{title:"标签",key:"name"},{title:"值",key:"options"}],data: [], 
         }
       },
       methods:{
        removeOptions (index) {
            this.modal.options.splice(index, 1)
        },
        addOption () {
            this.modal.options.push("") 
        },
        editBaseData(){
            if(!this.modal || this.modal.options.length<1 || this.modal.options[0]=="" ){this.$Message.info("请输入数据");return;}
            //暂定
            let data=store["sysBaseData"]?JSON.parse(store["sysBaseData"]):[];
            let d=this.modal;
            console.log("this.modal:",this.modal,"!this.modal:",(!this.modal),"this.modal.id<1:",(this.modal.id<1)
            ,"this.modal.id:",(this.modal.id))
            let isConfirm=false
            if(!this.modal || !this.modal.id || this.modal.id<1){
                d.id=data.length+1;
                data.push(d);
                isConfirm=true;
            }else{
                if (confirm(`您确认要修改吗?`)) {
                    isConfirm=true;
                    data.forEach(item => {
                        if(item.id==this.modal.id)
                            Object.assign(item, this.modal)
                    })
                }
            }
            if(isConfirm){
            this.data=data;
            store["sysBaseData"]=JSON.stringify(data);
            this.$Message.info("保存成功")
            this.showModal=false;}
        },
        loadColumns(){
          this.columns.push({title:"操作",key:"id",
            render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: { 
                      size: "small"
                    },
                    style: { 
                      display:(params.row.id>0)?"inline-block":"none",
                    },
                    on: {
                      click: () => {
                        let data=store["sysBaseData"]?JSON.parse(store["sysBaseData"]):[];
                        data.some(d=>{
                            if(d.id==params.row.id)
                                this.modal=d;
                            return ;
                        })
                        this.showModal=true;
                      }
                    }
                  },
                  "修改"
                ),
                h(
                  "Button",
                  {
                    props: { 
                      size: "small"
                    },
                    style: { 
                      display:(params.row.id>0)?"inline-block":"none",
                    },
                    on: {
                      click: () => {
                      if (confirm(`您确认要删除吗?`)) {
                        //暂定
                        this.data.splice(this.data.findIndex((v) => v.id === params.row.id),1);
                        store["sysBaseData"]=JSON.stringify(this.data)
                        this.$Message.info("删除成功");
                        return
                        this.$ws.addFunc(proto.DelTemplateDataRsp, function (rsp) {
                          if (rsp === code.OK) {
                            this.$Message.info("删除成功");
                            this.data.splice(this.data.findIndex((v) => v.id === params.row.id),1);
                          } else {
                            this.$Message.error(code.Message(rsp))
                          }
                        }, this)
                        this.$ws.call(proto.DelTemplateData,params.row.id);
                    }
                      }
                    }
                  },
                  "删除"
                )
              ]);
            }
          }); 
        },
        getData(id){
            let data=store["sysBaseData"]?JSON.parse(store["sysBaseData"]):[];
            data.map(d=>{
                return d.id==id;
            })
            return ;
        },
        async loadData(){             
            this.data=store["sysBaseData"]?JSON.parse(store["sysBaseData"]):[];
         }, 
       } ,  
       created(){ 
         this.loadColumns();
         this.loadData();
       }
     }
     </script> 