<template>
    <div>
      <div class="content">
        <!-- 按钮 -->
        <div class="btns">
            <p class="btn" @click="viewDesign=true"><Icon type="ios-create-outline" size="24" />配置</p>
            <p class="btn" @click="model={};addData=true;viewData=true"><Icon type="ios-add" size="24"/>添加</p>
            <p class="btn" @click="isSearch=true"><Icon type="ios-search" size="24"/>筛选</p>
        </div>
        <!-- 列表 -->
        <Table :columns="columns" :data="data">
          <template #action="scope">
            <Icon type="ios-create" @click="()=>{model=scope.row;viewData=true}" size="26"/>
            <Icon type="ios-trash" @click="delData(scope.row)" size="26"/>
          </template>
        </Table>
        <Page v-if="query.total>0" :total="query.total" :page-size="query.size" @on-change="changepage" show-elevator show-total></Page>
      </div>
      <!-- 高级查询 --> 
      <Modal v-model="isSearch" title="高级查询" width="650" :mask-closable="true" draggable footer-hide>
        <searcher v-if="designTemplate.data" :template="designTemplate.data" :search="Search"></searcher>
      </Modal>
      <!-- 页面数据 -->
      <Modal v-model="viewData" title="编辑数据" width="60%" footer-hide>
        <Data v-if="(addData ||viewData&&model&&model.id>0)" :model="model" :save="saveData" :template="designTemplate"></Data>
      </Modal>  
      <!-- 页面设计 -->
      <Modal v-model="viewDesign" title="编辑配置" width="70%" footer-hide>
        <form-design v-if="viewDesign" :menuId="menu.id" :type=0 :template="designTemplate" :callBack="refreshTemplate"></form-design>
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
import ajax from "../logic/ajax"
export default {
  name: "list",
  props:['menu'],
  components:{Data,FormDesign,Searcher},
  data() {
    return {
      viewDesign:false,addData:false,viewData:false,isSearch:false,
      //数据
      designTemplate:{},model:{},
      columns: [],data: [], 
      //分页
      query:{size:10,page:1,total:0},  
      //设置表头
      allColumns:[], checkProp: [],//二次操作时，重现已选择字段
    }
  },
  methods:{
    //选择查询条件后 服务器查询
    Search(where){
      this.isSearch=false
      console.log("search obj:",where)
      if(!where || where.length<1)return 
      this.loadData(this.menu.tid,where)
    },
    //跳转到指定页
    changepage(page){
      this.query.page=page
      this.loadData(this.menu.tid) 
    },
    //加载列表表头
    loadTemp(tId){
      if(tId<1) return
      this.columns=this.allColumns=[]
      this.$ws.addFunc(proto.TemplateInfoRsp, function (rsp) {
        if(rsp.code==code.OK)
          this.loadTempInfo(rsp) 
      }, this) 
      this.$ws.call(proto.TemplateInfo,tId);
    },
    loadTempInfo(rsp){
      this.columns=this.allColumns=[]
      console.log("loadTempInfo:",rsp.data)
      rsp.data.forEach(item=>{
        //根据op{tid:,ds:[]}从组options数据
        if(item.t===3||item.t===4||item.t===5)//radio||checkbox||select
        {
          switch(item.op.t){
            case 0://static
              item.options=[]
              if(item.op.ds && item.op.ds.length>0){
                item.op.ds.forEach(s=>{item.options.push({label:s,value:s})})
              }
              break;
            case 1://baseid
              this.$ws.addFunc(proto.DataSourceInfoRsp, function (r) {
                item.options=[]
                JSON.parse(r.source.source).forEach(s=>{item.options.push({label:s,value:s})})
              }, this)
              this.$ws.call(proto.DataSourceInfo,item.op.ds)
              break; 
          }
        }
        this.allColumns.push({title: item.n, key: item.id})
      })
      if(this.allColumns.length<1)return
      this.designTemplate={tid:rsp.tid,index:rsp.index,layout:rsp.layout,data:rsp.data}
      console.log("designTemplate:",this.designTemplate)
      this.columns=[...this.allColumns]
      this.columns.push({slot:"action",width:100,align: "center",renderHeader: (h) => {return this.setOprColumn(h)}})
    },
    //加载操作列+表头字段设置
    setOprColumn(h){
      return h(TableColumn,{
            props:{
                content:'操作',
                data:this.allColumns,
                checkList:this.checkProp,
            },
            on:{
                'handChange':(obj)=>{ 
                  this.checkProp=obj
                  this.dealTableColumn() 
                },
            }
          })
    },
    //模板页保存后，刷新当前页面数据
    refreshTemplate(tid,atomicId,layoutInfo,dbTemplates){
        this.viewDesign=false
        this.loadTempInfo({tid:tid,index:atomicId,layout:layoutInfo,data:dbTemplates})
    },
    //模板设计---保存
    saveTemp(tId,forms,atomicId,layout,clear){
      console.log(forms)
      let dbTemplates =widget.parseTo(forms)
      console.log(dbTemplates)
      let layoutInfo=JSON.stringify(layout.grid)
      this.$ws.addFunc(proto.EditTemplateInfoRsp, function (rsp) {
        if (rsp.code === code.OK) {         
          this.viewDesign=false
          if(tId>0){//update
            this.$Message.info("保存成功");
          }else{//insert
            this.$ws.addFunc(proto.BindTemplateRsp, function (rsp) {
              if (rsp.code === code.OK) { 
                this.$Message.info("保存成功");
              } else {
                this.$Message.error(code.Message(rsp.code))
              }
            }, this)
            this.$ws.call(proto.BindTemplate,this.menu.id,rsp.id,0);
          }
           //刷新列表字段
           this.loadTempInfo({tid:rsp.id,index:atomicId,layout:layoutInfo,data:dbTemplates})
          } else
            this.$Message.error(code.Message(rsp.code))
        }, this)
      this.$ws.call(proto.EditTemplateInfo,tId,dbTemplates,atomicId,layoutInfo,0,"",clear);
    },
    //加载列表数据
    loadData(tid,search){ 
      if(tid<1)return
      if(!search)search=[]
      this.$ws.addFunc(proto.TemplateDataRsp, function (rsp) {
          if (rsp.code === code.OK) { 
            this.data=[];
            let rspD={}
            rsp.data.forEach(d=>{
              rspD={}
              for(let j=0;j<rsp.fields.length;j++){
                rspD[rsp.fields[j]]=d[j]//rsp.fields[j]: id OR A OR B OR C
              }
              this.data.push(rspD)
            })
            this.query.total=rsp.total
          }
      }, this) 
      this.$ws.call(proto.TemplateData,tid,this.query.page,this.query.size,search)
    },
    handleUpload(file){
      
    },
    //保存数据
    saveData(did,tid,forms){
      console.log("forms:",forms);
      //有上传图片或文件
      let d={}
      forms.forEach(f=>{
        if((f.type==10 || f.type==11) && f.value !=""){//上传图片或文件
          d[f.id]=f.value
        }return f
      })
      console.log("data:",d)
    
      ajax.Upload(tid,d,0).then((res)=>{
        console.log("ajax res:",res)
        if(res.code==code.OK){ 
          Object.keys(res.fields).forEach(k=>{
            forms.forEach(f=>{
              if(f.id==k)f.value=res.fields[k]
            })
          })
          console.log("forms:",forms) 
          let dbTemplates=widget.parseTo(forms)
          let data={}
          dbTemplates.map(w=>{data[w.id]=w.v})
          this.$ws.addFunc(proto.EditTemplateDataRsp, function (rsp) {
            if (rsp.code === code.OK) {
              this.viewData=false
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
            } else {
              this.$Message.error(code.Message(rsp.code))
            }
          }, this)
          this.$ws.call(proto.EditTemplateData,did,tid,data);

        }
      })
    
    },
    //删除数据
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
        this.$ws.call(proto.DelTemplateData,row.id,this.menu.tid);
      }
    },  
    //设置显示字段后，重置列表表头
    dealTableColumn(){
      if(this.checkProp.length<1 || this.allColumns.length<1)return;
      this.columns = [];
      this.checkProp.map(f=>{
        this.allColumns.map(a=>{if(a.key==f)this.columns.push(a)})
      })
      this.columns.push({slot:"action",width:100,align: "center",renderHeader: (h) => {return this.setOprColumn(h)}})
    },
  },
    mounted(){
      console.log("this.m:",this.menu)
      if(this.menu.type==0){//list
        this.loadTemp(this.menu.tid)
        this.loadData(this.menu.tid)
      }
    } 
}
</script>
 
 <style>
  .ivu-modal-no-mask {
    pointer-events: auto !important; /**透设除弹框外其他区域不能点击  !important强制覆盖原样式，不然此属性不起作用*/
    background-color: rgba(0,0,0,0.3); /**透明的遮罩效果 */
  }
  /* 页面设计 顶层距离0 */
.ivu-modal-body:last-child{padding:0;padding-bottom:20px;}
</style>
