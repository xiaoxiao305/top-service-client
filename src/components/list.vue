<template>
    <div>
      <div class="content">
        <div>
          <Button @click="viewDesign=true" type="primary" style="width:100px;">编辑配置</Button>
          <Button v-if="columns&& columns.length>0" @click="viewData=true" type="primary" style="width:100px;">添加数据</Button>
          <Button v-if="columns&& columns.length>0" @click="showSetting" type="primary" style="width:100px;">设置表头</Button>
          <Button v-if="columns&& columns.length>0" @click="showSearch" type="primary" style="width:100px;">高级查询</Button>
        </div>
        <!-- 高级查询 -->
        <Modal
          v-model="isSearch"
          title="高级查询"
          draggable footer-hide width="650">
          <searcher :template="designTemplate.data" :search="Search"></searcher>
        </Modal>
        <!-- 配置表头 -->
        <Drawer title="字段配置" :closable=true placement="right" v-model="isSetting">
          <table-column
          :dataArr="allColumns"
          :checkList="checkProp"
          :defaultArr="checkProp"
          :confirm="handleConfirm" :closeSetting="setSetting"
        />
      </Drawer>
        <Table :columns="columns" :data="data">
          <template #action="scope">
            <Button type="info" size="small" @click="()=>{model=scope.row;viewData=true}">编辑</Button>
            <Button type="warning" size="small" @click="delData(scope.row)">删除</Button>
          </template>
        </Table>
        <Page v-if="query.total>0" :total="query.total" :page-size="query.size" @on-change="changepage" show-elevator show-total></Page>
      </div>
      <Modal v-model="viewDesign" title="编辑配置" width="80%">
        <form-design v-if="viewDesign" :type=0  :save="saveTemp" :template="designTemplate"></form-design>
        <div slot="footer"></div>
      </Modal>
      <Modal v-model="viewData" title="添加数据" width="800">
        <Data v-if="viewData" :model="model" :save="saveData" :template="designTemplate"></Data>
        <div slot="footer"></div>
      </Modal>
    </div>
  </template>
  <script>
    import widget from "../logic/custom-widget";
    import Data from "../components/data";
    import FormDesign from "../components/form-design";
    import proto from "../logic/proto"
    import code from "../logic/code"
    import TableColumn from '../components/table-column'
    import Searcher from '../components/searcher'
     export default {
       name: "list",
       props:['menu','setTab'],
       components:{Data,FormDesign,TableColumn,Searcher},
       data() {
         return {
           viewDesign:false,viewData:false,designTemplate:{},model:{},
           columns: [],data: [], 
           //分页
           query:{size:10,page:1,total:0},  
        //设置表头
           allColumns:[],isSetting: false, checkProp: [],
           //查询条件
           isSearch:false
         }
       },
       methods:{
        Search(obj){
          console.log("list search obj:",obj)
          let l=[];
          this.data.forEach(d=>{
            obj.items.forEach(o=>{
              if(d[o.field]){//有查询条件
                let isFind=false
                switch (o.symbol){
                  case "eq":
                    if(d[o.field]==o.value) isFind=true
                  break;
                  case "ne":
                    if(d[o.field]!=o.value) isFind=true
                  break;
                  case "gt":
                    if(d[o.field]>o.value) isFind=true
                  break;
                  case "lt":
                    if(d[o.field]<o.value) isFind=true
                  break;
                  case "ge":
                    if(d[o.field]>o.value || d[o.field]==o.value) isFind=true
                  break;
                  case "le":
                    if(d[o.field]<o.value || d[o.field]==o.value) isFind=true
                  break; 
                }
                if(isFind) l.push(d)
              }
            })
          })
          this.data=l
        },
        showSearch(){
          this.isSearch=true
        },
        dealTableColumn(){
          this.columns = [];
          this.checkProp.map(f=>{
            this.allColumns.map(a=>{if(a.key==f)this.columns.push(a)})
          })
          if(this.columns.length>0)
            this.columns.push({title: "操作", key: "action",slot:"action",width:100,align: "center"})
        },
        changepage(page){
          this.query.page=page
          this.loadData(this.menu.tid) 
        },
        loadTemp(tId){
          if(tId<1) return
          this.$ws.addFunc(proto.TemplateInfoRsp, function (rsp) {
            this.designTemplate={tid:rsp.tid,index:rsp.index,layout:rsp.layout,data:rsp.data};
            this.columns=this.allColumns=[]
            let fields=JSON.parse(rsp.data)
            fields.forEach(item=>{this.allColumns.push({title: item.n, key: item.id})})
            this.columns=[...this.allColumns]
            this.columns.push({title: "操作", key: "action",slot:"action",width:100,align: "center"})
            // this.template={layout:JSON.parse(rsp.layout),widgets:widget.recover(fields)}
          }, this) 
          this.$ws.call(proto.TemplateInfo,tId);
        },
        saveTemp(tId,forms,atomicId,layout){
          console.log("saveTemp ",tId,forms,atomicId,layout)
          let dbTemplates =widget.parseTo(forms)
          let layoutInfo=JSON.stringify(layout.grid)
          this.$ws.addFunc(proto.EditTemplateInfoRsp, function (rsp) {
              if (rsp.code === code.OK) {
                //刷新列表字段
                this.columns=this.allColumns=[]
          console.log("columns11:",this.columns,"allColumn11:",this.allColumns)
                this.designTemplate={tid:rsp.tid,index:atomicId,layout:layoutInfo,data:JSON.stringify(dbTemplates)}
                dbTemplates.forEach(item=>{this.allColumns.push({title: item.n, key: item.id})})
                this.columns=[...this.allColumns]          
                console.log("columns2:",this.columns,"allColumn2:",this.allColumns)
                this.columns.push({title: "操作", key: "action",slot:"action",width:100,align: "center"})
                this.viewDesign=false
                if(tId>0){//update
                  this.$Message.info("保存成功");
                }else{//insert
                  this.$ws.addFunc(proto.BindTemplateRsp, function (rsp) {
                  if (rsp === code.OK) { 
                    this.$Message.info("保存成功");
                  } else {
                    this.$Message.error(code.Message(rsp))
                  }
                }, this)
                this.$ws.call(proto.BindTemplate,rsp.tid,this.menu.id);
              }
              } else {
                this.$Message.error(code.Message(rsp.code))
              }
            }, this)
          this.$ws.call(proto.EditTemplateInfo,tId,JSON.stringify(dbTemplates),atomicId,layoutInfo,0,"");
        },
        loadData(tid){ 
          if(tid<1)return
          this.$ws.addFunc(proto.TemplateDataRsp, function (rsp) {
              if (rsp.code === code.OK) { 
                this.data=[];
                let rspD={}
                for(let i=0;i<rsp.data.length;i++){
                  rspD=JSON.parse(rsp.data[i]);
                  rspD.id=rsp.id[i];
                  this.data.push(rspD)
                }
                this.query.total=rsp.total
              }
          }, this) 
          this.$ws.call(proto.TemplateData,tid,this.query.page,this.query.size)
        },
        saveData(did,tid,forms){
          let dbTemplates=widget.parseTo(forms)
          let data={}
          dbTemplates.map(w=>{data[w.id]=w.n+parseInt(Math.random()*100)})
          this.$ws.addFunc(proto.EditTemplateDataRsp, function (rsp) {
            if (rsp.code === code.OK) {
              this.$Message.info("保存成功");
               //刷新列表数据
              if(did>0){//修改
                data.id=did
                this.data= this.data.map(d=>{if(d.id==did)d=data;return d})
              }else{//新增
                data.id=rsp.id
                this.data.push(data)
                this.query.total+=1
              }
              this.viewData=false
            } else {
              this.$Message.error(code.Message(rsp.code))
            }
          }, this)
          this.$ws.call(proto.EditTemplateData,did,tid,JSON.stringify(data));
        },
        delData(row){
          if (confirm(`您确认要删除吗?`)) {
            this.$ws.addFunc(proto.DelTemplateDataRsp, function (rsp) {
              if (rsp === code.OK) {
                this.$Message.info("删除成功");
                this.query.total-=1
                this.data.splice(this.data.findIndex((v) => v.id === row.id),1);
              } else 
                this.$Message.error(code.Message(rsp))
            }, this)
            this.$ws.call(proto.DelTemplateData,row.id);
          }
        },

      // 点击配置表头图标
      showSetting() {
        this.isSetting = !this.isSetting
        if (this.checkProp.length<1) {
          this.allColumns.map(a=>{this.checkProp.push(a.key)})
        }
      },
      // 提交确定事件
      handleConfirm(val) {
        console.log("list handleConfirm:",val)
        this.checkProp = val
        this.dealTableColumn(this.checkProp)
      },
      setSetting(){
        this.isSetting=!this.isSetting
      }, 
       },
       mounted(){
        console.log("list mounted.menu:",this.menu)
        if(this.menu.type==0){//list
          this.loadTemp(this.menu.tid)
          this.loadData(this.menu.tid)
        }
       } 
     }
     </script>