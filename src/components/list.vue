<template>
    <div>
      <div class="content">
        <div>
          <Button v-if="columns&& columns.length>0" @click="openDataTab(0)" type="primary" style="width:100px;">添加数据</Button>
          <!-- 流程管理 暂定-->
          <div v-if="menu.id==49" style="width:300px;display:inline">
            <Button @click="addFlowPage=true" type="primary">页面设计</Button>
            <Button type="primary">发起流程</Button>
          </div>
          <Button v-else @click="openDesignTab" type="primary" style="width:100px;">编辑配置</Button>
        </div>
        <Table :columns="columns" :data="data"></Table>
        <Modal
          v-model="addFlowPage"
          title="添加页面" @on-ok="addFlowName"
          >
          页面名称： <Input v-model="pageName" placeholder="请输入页面名称"></Input>
        </Modal>
      </div>
    </div>
  </template>
  <script>
    import widget from "../logic/widget";
    import proto from "../logic/proto"
    import code from "../logic/code"
     export default {
       name: "list",
       props:['menu','setTab','templates','templatesData'],
       data() {
         return { 
           columns: [],data: [], 
           addFlowPage:false,pageName:''
         }
       },
       watch:{
        'templates': {
          handler: function (newVal, oldVal) {
            this.loadColumns()
          },
          deep: true
        },
        'templatesData': {
          handler: function (newVal, oldVal) {        
            this.data=newVal;
          },
          deep: true
        },
       },
       methods:{
        addFlowName(){
          let id=parseInt((Math.random())*100);
          let page={id:id,name:this.pageName,tid:0}
          let pages=store['flowPage']?JSON.parse(store['flowPage']):{};
          pages[id]=page;
          store['flowPage']=JSON.stringify(pages)
          this.setTab({id:page.id,name:this.menu.name+"/页面设计",icon:this.menu.icon,type:3,tid:0});
        },
        openFormTab(){
          this.setTab({id:this.menu.id,name:this.menu.name+"/页面设计",icon:this.menu.icon,type:3});
        },
        openDataTab(dataId){
           this.setTab({id:this.menu.id,name:this.menu.name+"/添加数据",icon:this.menu.icon,type:2,tid:this.menu.tid,did:dataId});
        },
        openDesignTab(){
          this.setTab({id:this.menu.id,name:this.menu.name+"/字段编辑",icon:this.menu.icon,type:1,tid:this.menu.tid});
        }, 
        async loadColumns(){
          this.columns=[]; 
          let dbTemplates=(!this.templates||!this.templates.data||this.templates.data.length<1)?await widget.loadTemplateInfo(this.menu.tid):this.templates;
          if(!dbTemplates || !dbTemplates.data || dbTemplates.data.length<1)return;
          dbTemplates.data.forEach(t=>{
            this.columns.push({title:t.n,key:t.f})
          })
          if(this.columns.length<1)return;//操作列
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
                        this.openDataTab(params.row.id);
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
        async loadData(){ 
            this.data=(!this.templatesData||this.templatesData.length<1)?
                await widget.loadTemplateData(this.menu.tid,1,10):this.templatesData;
         }, 
       } ,  
       created(){ 
         this.loadColumns();
         this.loadData();
       }
     }
     </script> 