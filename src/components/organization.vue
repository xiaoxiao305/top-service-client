<template>
<div>
  <Row>
    <Col span="4" :class="['menu',show?'':'hide']" style="min-height:500px;">
      <!-- <Drawer :inner=true :transfer=false placement="left" v-model="show" > -->
        <tree :key="componentKey" :onSelect="select" :items="organizations" :onEdit="editOrganization" :onDel="delOrganization"></tree>
      <!-- </Drawer> -->
    </Col>
    <!-- <tree :key="componentKey" :onSelect="select" :items="organizations" :onEdit="editOrganization" :onDel="delOrganization"></tree> -->
    <Col span="20">
      <!-- <Icon type="md-menu" size="24" @click="show=!show" 
      :class="[show?'recovery':'rotate']"></Icon> -->
      <div v-if="curOrg.id>0" class="content">
      <div class="btns">
        <p class="btn" @click="addData"><Icon type="ios-add" size="24"/>添加员工</p>
        <p class="btn" @click="isSearch=true"><Icon type="ios-search" size="24"/>筛选</p>
      </div>
      <Table :columns="columns" :data="employees">
        <template #action="scope">
          <Icon type="ios-create" @click="edit(scope.row)" size="26"/>
        </template>
      </Table>
      <Page v-if="query.total>0" :total="query.total" :page-size="query.size" @on-change="changepage" show-elevator show-total></Page>
    </div>
    </Col>
  </Row>
  <!-- 高级查询 --> 
  <Modal v-model="isSearch" title="高级查询" width="650" :mask-closable="true" draggable footer-hide>
    <searcher v-if="template2.widgets" :template="template2.widgets" :search="Search"></searcher>
  </Modal>
 
  <Modal v-model="viewInfo" title="编辑员工数据" width="650" footer-hide>
<div style="display: flex;flex-direction: column;"> 
  <table class="preview data">
    <tr v-if="userInfo.id<1">
      <td>
        <div><b>账号</b><Input v-model="userInfo.account" placeholder="请输入账号" /></div>
      </td>
    </tr>
    <tr v-if="userInfo.id<1">
      <td>
        <div><b>密码</b><Input type="password" v-model="userInfo.pass" placeholder="请输入密码"/></div>
      </td>
    </tr>
    <tr> 
    </tr>
    <tr v-for="(columns,r) in template.layout" :key="r">
        <td v-for="(col,c) in columns" v-if="col!==-1" :colspan="col%100>1?col%100:null" :rowspan="col>199?Math.floor(col/100):null" :key="r+'-'+c">
          <div v-for="(widget,i) in widgets(r,c)" :key="i">
            <b>{{widget.name}}</b><w :model="widget"></w>
          </div>
        </td>
      </tr> 
  </table>
  <p style="margin-left:auto;margin-right: 5%" class="btn" @click="updateEmployeeInfo"><Icon type="ios-create-outline" size="24" />保存</p>
</div>
  </Modal>
</div>
</template>
<script>
import proto from "../logic/proto";
import tree from "../components/tree/tree"
import code from "../logic/code"
import widget from "../logic/custom-widget";
import md5 from "js-md5"; 
import TableColumn from '../components/table-column'
import w from '../components/widget'
import Searcher from '../components/searcher'
export default {
  name: "organization",
  components:{tree,TableColumn,w,Searcher},
  data(){
    return{
      columns:[],
      employees:[],
      organizations:[],
      viewInfo:false,
      query:{size:10,page:1,total:0},
      template:{layout:[],widgets:[]},
      componentKey:0,curOrg:{},
      userInfo:{id:0,account:"",pass:""},
      allColumns:[],checkProp: [],show:true,isSearch:false,template2:{layout:[],widgets:[]},
    }
  },
  methods:{
    //选择查询条件后 服务器查询
    Search(where){
      this.isSearch=false
      console.log("search obj:",where)
      if(!where || where.length<1)return 
      this.loadEmployees(this.curOrg.id,where)
    },
    changepage(page){
      this.query.page=page
      this.loadEmployees(this.curOrg.id) 
    },
    addData(){
      if(!this.curOrg.id || this.curOrg.id<1){
        this.$Message.info("请选择组织机构")
        return
      }
      this.viewInfo=true
      this.userInfo={id:0,account:"",pass:""}
      this.template.widgets.map(w=>{w.value=''})
    },
    widgets(r,c){
      let widgets=[]
      for (let i=0;i<this.template.widgets.length;i++){
        let widget=this.template.widgets[i]
        if (widget.pos[0]==r && widget.pos[1]==c){
          widgets.push(widget)
        }
      }
      return widgets
    },
    updateEmployeeInfo(){
      if(this.userInfo.id<1 &&(this.userInfo.account==""||this.userInfo.pass==""))return
      let data={}
      this.template.widgets.map(w=>{data[w.id]=w.value})
      if(this.userInfo.id<1)//只有添加员工才能传acc+pass
        data=Object.assign(data,{acc:this.userInfo.account,pass:md5(this.userInfo.pass)})
      this.$ws.addFunc(proto.EditEmployeeInfoRsp,(rsp=>{
        if (rsp.code===code.OK){ 
          this.$Message.info("保存成功")  
          if(this.userInfo.id<1){//add
            let e={id:rsp.id,account:this.userInfo.account,pass:md5(this.userInfo.pass),status:1,data:data,org_id:this.curOrg.id}
            this.employees.push(Object.assign(e,e.data))

          }else{
            this.employees.map(e=>{if(e.id==rsp.id){
              let keys=Object.keys(data)
              for(let i=0;i<keys.length;i++){
                e[keys[i]]=data[keys[i]]
              }
            }})
          }
          this.query.total +=1; 
          this.viewInfo=false
        }else{
          this.$Message.error(code.Message(rsp.code))
        }}))
      this.$ws.call(proto.EditEmployeeInfo,this.userInfo.id,this.curOrg.id,0,0,data)
     },
    select(model){
      this.curOrg=model
      this.$ws.addFunc(proto.EmployeeTemplateRsp,this.init,this)
      this.$ws.call(proto.EmployeeTemplate)
      this.loadEmployees(model.id)
    },
    editOrg(list,parent,newOrg,action){
      let isFind=false
      if(action==2){//删除
        let index=list.findIndex((l) => l.id ===newOrg.id);
        if(index>=0){list.splice(index,1);isFind=true}
        this.query.total -=1
      }else{
        list=list.map(l=>{
          if(action==0){//添加
            if(l.id==parent){
              if(!l.children)this.$set(l, 'children', [])
              l.children.push(newOrg)
              isFind=true
            }
          }else if(action==1){//修改
            if(l.id==newOrg.id){l.name=newOrg.name;l.edit=false;isFind=true}
          }
          return l
        })
      }
      if(!isFind){
        for(let i=0;i<list.length;i++){
          list[i].children=this.editOrg(list[i].children,parent,newOrg,action)
        }
      }
      return list;
    },
    //添加或编辑组织结构
    editOrganization(name,parent,action,id){
      console.log("onEdit")
      if(name.trim()=="")return;
      this.$ws.addFunc(proto.EditOrganizationRsp,(rsp=>{
        if (rsp.code===code.OK){
          if(action==0){//添加
            let item={id:rsp.id,name:name,tid:0,toolbar: false, edit: false, add: false, fold: false,children:[],parent:parent}
            if(parent==0){
              this.organizations.push(item);
            }else{
              this.editOrg(this.organizations,parent,item,action)
            }
            this.query.total +=1
          }else//修改
            this.editOrg(this.organizations,parent,{id:id,name:name},action)
          this.componentKey=(new Date()).format("yyyyMMddhhmmss");
        }else{
          this.$Message.error(code.Message(rsp.code))
        }}))
      this.$ws.call(proto.EditOrganization,id,parent,name)
    },
    delOrganization(item){
      if (item.children && item.children.length > 0)return
       if (confirm(`您确认要删除 ${item.name} 吗?`)) {
        this.$ws.addFunc(proto.DeleteOrganizationRsp, function (rsp) {
          if (rsp === code.OK) {
            this.editOrg(this.organizations,0,{id:item.id},2)
            this.componentKey=(new Date().format("yyyyMMddhhmmss"))
          } else {
            this.$Message.error(code.Message(rsp))
          }
        }, this)
        this.$ws.call(proto.DeleteOrganization,item.id);
      }
    }, 
    edit(row){ 
      this.viewInfo=true  
      this.userInfo=row 
      this.template.widgets.map(w=>{
        let keys=Object.keys(this.userInfo)
        for(let i=0;i<keys.length;i++){
          if(w.id==keys[i])
            w.value=this.userInfo[keys[i]]
        }
      })
    },
    loadEmployees(org,search){
      if(org<1)return
      if(!search)search=[]
      this.$ws.addFunc(proto.EmployeesRsp,function (rsp){
        this.employees=[]
        if(rsp.code==code.OK) {
          this.employees=[]
          if(rsp.data.length>0 && rsp.fields.length>0){
            let item={}
            rsp.data.map(d=>{
              item={}
              rsp.fields.map((f,i)=>{item[f]=d[i]})
              item.account=item.account.replace(new RegExp((window.domain()+'-'), "g"),'');
              this.employees.push(item)
            })
          }
          this.query.total = rsp.total
        }
      },this)
      this.$ws.call(proto.Employees,org,this.query.page,this.query.size,search)
    },
    LoadOrganizations(list){
      let children = {}
      this.organizations=[]
      list.forEach(item=>{children[item.id]=[]})
      list.forEach(item => {
        item = Object.assign(item, {toolbar: false, edit: false, add: false, fold: false,children:[]})
        if (item.parent===0)
          this.organizations.push(item)
        else
        children[item.parent].push(item)})
      let recursive=function (it,children){
        it.children.forEach(item => {
          item.children = children[item.id]
          if (item.children && item.children.length > 0) {
            recursive(item, children)
          }
        })
      }
      this.organizations.forEach(it => {
        if (children[it.id].length>0){
          it.children = children[it.id]
          if (it.children.length > 0) recursive(it, children)
        }
      }) 
    },
    init(rsp){
      this.columns=this.allColumns=[]
      this.allColumns.push({title: "ID", key:"id"})
      this.allColumns.push({title: "账号", key:"account"})
      this.allColumns.push({title: "创建时间", key:"createAt"})
      this.allColumns.push({title: "登录时间", key:"loginAt"})
      this.allColumns.push({title: "状态", key:"status"})
      if(rsp.code == code.OK)   {
      let fields=rsp.data
      fields.forEach(item=>{this.allColumns.push({title: item.n, key: item.id})})
      this.columns=[...this.allColumns]
      this.columns.push({title: "操作", key: "action",slot:"action",width:100,align: "center",renderHeader: (h, params) => {return this.setOprColumn(h)}})
      this.template={layout:JSON.parse(rsp.layout),widgets:widget.recover(fields)}
      this.template2={layout:JSON.parse(rsp.layout),widgets:fields}
      }
    },
    setOprColumn(h){
      return h('div',[
          h(TableColumn,{
            props:{                                
                content:'操作',
                data:this.allColumns,
                checkList:this.checkProp,
            },
            on:{
                'handChange':(obj)=>{ 
                  this.checkProp=obj
                  this.dealTableColumn(this.checkProp) 
                },
            }
          })
      ])
    }, 
    //重置表头列
    dealTableColumn(){
      this.columns = [];
      this.checkProp.map(f=>{
        this.allColumns.map(a=>{if(a.key==f)this.columns.push(a)})
      })
      if(this.columns.length>0)
      this.columns.push({title: "操作", key: "action",slot:"action",width:100,align: "center",renderHeader: (h, params) => {return this.setOprColumn(h)}})
    }, 
  },
  created() {
    this.$ws.addFunc(proto.OrganizationsRsp,this.LoadOrganizations,this)
    this.$ws.call(proto.Organizations) 
  }
}
</script>
<style>
.show i,p{display: inline-block;}
.show:hover{background-color: #f5f5f5;}
.hide{display:none;}

.preview{width:100%;border-collapse: collapse;margin:3%}
</style>