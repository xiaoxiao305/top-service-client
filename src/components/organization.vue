<template>
<div>
  <Row>
    <Col span="5"><tree :key="componentKey" :onSelect="select" :items="organizations" :onEdit="editOrganization" :onDel="delOrganization"></tree></Col>
    <Col span="19" v-if="curOrg.id>0">
      <Button type="primary" @click="addData">添加员工</Button>
      <Button v-if="columns&& columns.length>0" @click="showSetting" type="primary">设置表头</Button>
        <!-- 配置表头 -->
        <Drawer title="字段配置" :closable=true placement="right" v-model="isSetting">
          <table-column
          :dataArr="allColumns"
          :checkList="checkProp"
          :defaultArr="checkProp"
          :confirm="handleConfirm" :closeSetting="setSetting"
        />
      </Drawer>
      <Table :columns="columns" :data="employees">
        <template #action="scope">
          <Button type="info" size="small" @click="edit(scope.row)">编辑</Button>
        </template>
      </Table>
      <Page v-if="query.total>0" :total="query.total" :page-size="query.size" @on-change="changepage" show-elevator show-total></Page>
    </Col>
  </Row>
  <Modal v-model="viewInfo" title="编辑员工信息" width="800">
    <table>
      <tr>
        <td><b>账号</b><Input v-model="userInfo.account" placeholder="请输入账号"></Input></td>
        <td><b>密码</b><Input v-model="userInfo.pwd" placeholder="请输入密码"></Input></td>
        <td><b>姓名</b><Input v-model="userInfo.name" placeholder="请输入姓名"></Input></td>
      </tr>
      <tr v-for="(columns,r) in template.layout" :key="r">
        <td v-for="(col,c) in columns" v-if="col!==-1" :colspan="col%100>1?col%100:null" :rowspan="col>199?Math.floor(col/100):null" :key="r+'-'+c">
          <div v-for="(widget,i) in widgets(r,c)" :key="i" >
            <b>{{widget.name}}</b><widget :model="widget"></widget>
          </div>
        </td>
      </tr>
    </table>
    <div slot="header">
      <Button type="primary" @click="updateEmployeeInfo">确定</Button>
    </div>
    <div slot="footer"></div>
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
export default {
  name: "organization",
  components:{tree,"Widget":widget.Widget,TableColumn},
  data(){
    return{
      columns:[],
      employees:[],
      organizations:[],
      viewInfo:false,
      query:{size:3,page:1,total:0},
      template:{layout:[],widgets:[]},
      componentKey:0,curOrg:{},
      userInfo:{id:0,account:"acc"+parseInt(Math.random()*100),pwd:"pwd"+parseInt(Math.random()*100),name:"name"+parseInt(Math.random()*100)},
      allColumns:[],isSetting: false, checkProp: [],
    }
  },
  methods:{
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
      this.$forceUpdate()
      console.log("after forceUpdate:",this.template.widgets)
      if(this.userInfo.account==""||this.userInfo.pwd=="")return
      let data={}
      this.template.widgets.map(w=>{data[w.id]=w.name+parseInt(Math.random()*100)})
      this.$ws.addFunc(proto.EditEmployeeInfoRsp,(rsp=>{
        if (rsp.code===code.OK){ 
          this.$Message.info("保存成功")  
          let e={id:rsp.id,account:this.userInfo.account,pass:md5(this.userInfo.pwd),name:this.userInfo.name,status:1,data:data,org_id:this.curOrg.id}
          this.employees.push(Object.assign(e,e.data))
          this.query.total +=1; 
          this.viewInfo=false
        }else{
          this.$Message.error(code.Message(rsp.code))
        }}))
      this.$ws.call(proto.EditEmployeeInfo,this.userInfo.id,this.curOrg.id,this.userInfo.account,md5(this.userInfo.pwd),JSON.stringify(data),this.userInfo.name)
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
      this.employees.forEach((item,i)=>{
        if(row.id==item.id){
          this.userInfo=item
          let fields=JSON.parse(item.data)
      // fields.forEach(item=>{this.columns.push({title: item.n, key: item.id})})
      // this.template={widgets:widget.recover(fields)}
          return
        }        
      })
    },
    loadEmployees(org){
      if(org<1)return
      this.$ws.addFunc(proto.EmployeesRsp,function (rsp){
        this.employees=[]
        if(rsp.code==code.OK) {
          rsp.list.forEach((item, i) => {item.account=item.account.replace(new RegExp((window.domain()+'-'), "g"),'');
            rsp.list[i] = Object.assign(item, JSON.parse(item.data))})
          this.employees = rsp.list
          this.query.total = rsp.total
        }
      },this)
      this.$ws.call(proto.Employees,org,this.query.page,this.query.size)
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
      this.allColumns.push({title: "姓名", key:"name"})
      this.allColumns.push({title: "创建时间", key:"createAt"})
      this.allColumns.push({title: "登录时间", key:"loginAt"})
      this.allColumns.push({title: "状态", key:"status"})
      if(rsp.code == code.OK)   {
      let fields=JSON.parse(rsp.data)
      fields.forEach(item=>{this.allColumns.push({title: item.n, key: item.id})})
      this.columns=[...this.allColumns]
      this.columns.push({title: "操作", key: "action",slot:"action",width:100,align: "center"})
      this.template={layout:JSON.parse(rsp.layout),widgets:widget.recover(fields)}
      }
    },
    // 点击配置表头图标
    showSetting() {
      this.isSetting = !this.isSetting
      if (this.checkProp.length<1) {
        this.allColumns.map(a=>{this.checkProp.push(a.key)})
      }
    },
    dealTableColumn(){
      this.columns = [];
      this.checkProp.map(f=>{
        this.allColumns.map(a=>{if(a.key==f)this.columns.push(a)})
      })
      if(this.columns.length>0)
        this.columns.push({title: "操作", key: "action",slot:"action",width:100,align: "center"})
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
  created() {
    this.$ws.addFunc(proto.OrganizationsRsp,this.LoadOrganizations,this)
    this.$ws.call(proto.Organizations) 
  }
}
</script>

<style scoped>

</style>
