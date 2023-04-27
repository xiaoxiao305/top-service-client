<template>
    <!-- 系统设置 预设数据源 -->
    <div class="content">
      <div class="btns">
          <p class="btn" @click="()=>{this.modal={roles:{1:2}};showModal=true}"><Icon type="ios-create-outline" size="24" />添加</p>
      </div> 
      <Table v-if="data && data.length>0" :columns="columns" :data="data">
        <template #action="scope">
          <Icon type="ios-create" @click="findData(scope.row)" size="26"/>
          <Icon type="ios-trash" @click="delData(scope.row)" size="26"/>
        </template>
      </Table>
      <Page v-if="query.total>0" :total="query.total" :page-size="query.size" @on-change="changepage" show-elevator show-total></Page>
      <Modal
          v-model="showModal"  width="650" footer-hide
          title="编辑数据"> 
          <Form>
            <FormItem label="职能组名称"><Row><Col span="10"><Input v-model="modal.name" placeholder="请输入职能组名称"></Input></Col></Row></FormItem>
            <FormItem style="display:flex;flex-direction: column;">
              <Row><Col span="6">
                <Dropdown transfer @on-click="selectOrg">
                <a href="javascript:void(0)">
                    请选择部门{{ MenuText }}
                    <Icon type="ios-arrow-down"></Icon>
                </a>
                <Dropdown-menu slot="list">
                    <Dropdown-item v-for="org in organizations" :name="org.id" :key="org.id">
                        {{org.name}}
                    </Dropdown-item>
                </Dropdown-menu>
              </Dropdown>
            </Col><Col span="10"> 
                <Input  placeholder="请输入员工账号" v-model="empSearch.where"/>
              </Col><Col span="8">
                <Button type="primary" @click="search">查询</Button>
              </Col> </Row></FormItem>
              <FormItem><Table :columns="empColumns" :data="employees" @on-selection-change="selectEmpChange">
              </Table></FormItem>
              <FormItem><Button type="primary" @click="editBaseData">确定</Button></FormItem>
          </Form> 
          
      </Modal>
    </div> 
  </template>
  <script> 
    import proto from "../logic/proto"
    import code from "../logic/code"
    import BaseData from "../logic/data"
     export default {
       name: "OperationGroup",
       data() {
         return { 
            modal:{name:'',roles:{1:2}},showModal:false,
            columns: [{title:"ID",key:"id"},{title:"名称",key:"name"},{title:"员工部门信息",key:"employees"}],data: [],
            query:{size:10,page:1,total:0}, 
            organizations:[],employees:[],empColumns:[  {type: 'selection',width: 60,align: 'center'},{title:"ID",key:"id"},{title:"账号",key:"account"}],
            empQuery:{size:10,page:1,total:0},empSearch:{chk_org_id:0,where:"",chk_emps:[],chk_list:{}}
         }
       },
       methods:{
        editBaseData(){
          if(!this.modal || this.modal.name =="" || this.empSearch.chk_org_id<1){this.$Message.info("请填写数据");return;}
          this.modal.roles = {}
          Object.keys(this.empSearch.chk_list).map(key =>{if(this.empSearch.chk_list[key].length>0) {this.empSearch.chk_list[key].map(v=>{this.modal.roles[v] = parseInt(key)})}});
          console.log(this.modal.roles)
          this.$ws.addFunc(proto.EditOperationGroupRsp, function (rsp) {
            if (rsp.code === code.OK) {
              this.$Message.info("保存成功")              
              this.modal.roles=JSON.stringify(this.modal.roles)//添加后还原数据类型
              this.showModal=false;
              if(!this.modal.id || this.modal.id<1){
                this.modal.id=rsp.id
                this.data.push(this.modal)
              }
            } else 
              this.$Message.error(code.Message(rsp.code))
          }, this)
          console.log(JSON.stringify(this.modal.roles))
          this.$ws.call(proto.EditOperationGroup, this.modal.id?this.modal.id:0,this.modal.name,this.modal.roles)
        },
        findData(row){
          this.modal=this.data.find(d=>d.id==row.id)
          if(this.modal){
            // this.modal.roles=JSON.parse(this.modal.roles)
            this.showModal=true;
          }
        },
        delData(row){
          if (confirm(`您确认要删除吗?`)) {
          this.$ws.addFunc(proto.DeleteOperationGroupRsp, function (rsp) {
            if (rsp === code.OK) {
              this.$Message.info("删除成功");
              this.data.splice(this.data.findIndex((v) => v.id === row.id),1);
            } else {
              this.$Message.error(code.Message(rsp))
            }
          }, this)
          this.$ws.call(proto.DeleteOperationGroup,row.id);
        }
        },
        loadColumns(){
          this.columns.push({title: "操作", key: "action",slot:"action",width:100,align: "center"})
        },
        loadData(){
          this.$ws.addFunc(proto.OperationGroupListRsp, function (rsp) {
            if (rsp.code === code.OK){
              this.data=rsp.list
              this.query.total=rsp.total
            }
            else 
              this.$Message.error(code.Message(rsp.code))
          }, this)
          this.$ws.call(proto.OperationGroupList, this.query.page,this.query.size)
        },  
        selectEmpChange(selection){
          console.log("selection:")
          console.log(selection) 
          this.empSearch.chk_emps=[]
          if(selection.length>0)
            this.empSearch.chk_emps = [].concat(...selection.map(o => o.id));
          if(this.empSearch.chk_list.hasOwnProperty(this.empSearch.chk_org_id ))
            this.empSearch.chk_list[this.empSearch.chk_org_id ]=this.empSearch.chk_emps
          else
            this.$set(this.empSearch.chk_list, this.empSearch.chk_org_id , this.empSearch.chk_emps); //添加一个属性
          console.log(this.empSearch.chk_list)
        }, 
        //根据部门及查询条件查询员工
        search(){
          var where =[];
          if(this.empSearch.chk_org_id<1){  this.$Message.info("请选择部门");return}
          if(this.empSearch.where !="")
            where=[{"key":"account","val":this.empSearch.where,"op":1}]
          this.loadEmployees(this.empSearch.chk_org_id,where)
        },
        //根据部门及查询条件加载员工列表
        loadEmployees(org_id,where){
          this.$ws.addFunc(proto.EmployeesRsp,function (rsp){
            this.employees=[]
            if(rsp.code==code.OK) { 
              if(rsp.data.length>0 && rsp.fields.length>0){
                let item={}
                rsp.data.map(d=>{
                  item={}
                  rsp.fields.map((f,i)=>{item[f]=d[i]})
                  item.account=item.account.replace(new RegExp((window.domain()+'-'), "g"),'');
                  this.employees.push(item)
                })
                console.log("this.employees:",this.employees)
              }
              this.empQuery.total = rsp.total
            }
          },this)
          this.$ws.call(proto.Employees,org_id,this.empQuery.page,this.empQuery.size,where)
        },
        selectOrg(org_id){
          console.log("org_id:",org_id)
          this.empSearch.chk_org_id=org_id
        },
        //部门信息
        loadOrganizations(){
          this.organizations=[]
          this.$ws.addFunc(proto.OrganizationsRsp,function(rsp){
            this.organizations=rsp
          },this)
          this.$ws.call(proto.Organizations)
          },
        //跳转到指定页
        changepage(page){
          this.query.page=page
          this.loadData() 
        }, 
       } ,  
       created(){ 
         this.loadColumns();
         this.loadData(); 
         this.loadOrganizations()
       }
     }
     </script> 
<style scoped>
form{padding:20px 12px;text-align: center;width:60%;margin:0 auto}
</style>