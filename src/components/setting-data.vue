<template>
    <!-- 系统设置 预设数据源 -->
    <div class="content">
      <div class="btns">
          <p class="btn" @click="()=>{this.modal={source:['','','']};showModal=true}"><Icon type="ios-create-outline" size="24" />添加</p>
      </div> 
      <Table :columns="columns" :data="data">
        <template #action="scope">
          <Icon type="ios-create" @click="findData(scope.row)" size="26"/>
          <Icon type="ios-trash" @click="delData(scope.row)" size="26"/>
        </template>
      </Table>
      <Page v-if="query.total>0" :total="query.total" :page-size="query.size" @on-change="changepage" show-elevator show-total></Page>
      <Modal
          v-model="showModal"  width="650" footer-hide
          title="编辑数据"> 
          <Form v-if="modal.source && modal.source.length>0">
            <FormItem label="名 称"><Row><Col span="10"><Input v-model="modal.name" placeholder="请输入数据源名称"></Input></Col></Row></FormItem>
            <FormItem v-for="(item,index) in JSON.parse(JSON.stringify(modal.source))" :key="index" 
              :label="'值' + (index+1) + '：'">
                <Row :gutter="3">
                    <Col span="7">
                      <Input v-model="modal.source[index]"></Input >
                    </Col>
                    <Col span="4"><Icon style="line-height: 32px; color: #ff9900;cursor: pointer;" type="ios-remove-circle" size="24" @click="removeOptions(index)" /></Col>
                </Row>
            </FormItem>   
            <FormItem><Button type="dashed" long @click="addOption" icon="md-add">添加条件</Button></FormItem>
            <FormItem><Button type="primary" @click="editBaseData">确定</Button></FormItem>
          </Form> 
          <!-- 标签<Input v-model="modal.name" placeholder="请输入数据源名称" style="width:40%;"></Input>
          <ul v-if="modal.source && modal.source.length>0">
            <li v-for="(item,index) in modal.source" :key="index"  style="line-height:40px;width:100%;">
            值 {{ index }}<Input v-model="modal.source[index]"  style="width:40%;margin-right: 5px;"></Input >
            <i class="drag-item" style="font-size: 16px;margin: 0 5px;cursor: move;"><i class="iconfont icon-icon_bars"></i></i>
            <Button icon="md-remove"  @click="removeOptions(index)" circle plain  style="padding: 4px;margin-left: 5px;" ></Button>
            </li>
          </ul>
          <b @click="addOption" style="color:dodgerblue;cursor: pointer;">添加选项</b>
          <div slot="footer">
              <Button type="primary" @click="editBaseData">确定</Button>
          </div> -->
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
            modal:{name:'',source:[]},showModal:false,
            columns: [{title:"ID",key:"id"},{title:"标签",key:"name"},{title:"值",key:"source"}],data: [],
            query:{size:10,page:1,total:0}, 
         }
       },
       methods:{
        removeOptions (index) {
            this.modal.source.splice(index, 1)
        },
        addOption () {
            this.modal.source.push("") 
        },
        editBaseData(){
          console.log("editBaseData:",this.modal)
          if(!this.modal || this.modal.source.length<1 || this.modal.source[0]=="" ){this.$Message.info("请输入数据");return;}
          this.$ws.addFunc(proto.EditDataSourceRsp, function (rsp) {
            if (rsp.code === code.OK) {
              this.$Message.info("保存成功")              
              this.modal.source=JSON.stringify(this.modal.source)//添加后还原数据类型
              this.showModal=false;
              if(!this.modal.id || this.modal.id<1){
                this.modal.id=rsp.id
                this.data.push(this.modal)
              }
            } else 
              this.$Message.error(code.Message(rsp.code))
          }, this)
          this.$ws.call(proto.EditDataSource, this.modal.id?this.modal.id:0,this.modal.name,JSON.stringify(this.modal.source))
        },
        findData(row){
          this.modal=this.data.find(d=>d.id==row.id)
          if(this.modal){
            console.log(typeof this.modal.source,this.modal.source)
            this.modal.source=JSON.parse(this.modal.source)
            this.showModal=true;
          }
        },
        delData(row){
          if (confirm(`您确认要删除吗?`)) {
          this.$ws.addFunc(proto.DeleteDataSourceRsp, function (rsp) {
            if (rsp === code.OK) {
              this.$Message.info("删除成功");
              this.data.splice(this.data.findIndex((v) => v.id === row.id),1);
            } else {
              this.$Message.error(code.Message(rsp))
            }
          }, this)
          this.$ws.call(proto.DeleteDataSource,row.id);
        }
        },
        loadColumns(){
          this.columns.push({title: "操作", key: "action",slot:"action",width:100,align: "center"})
        },
        loadData(){
          this.$ws.addFunc(proto.DataSourcesRsp, function (rsp) {
            if (rsp.code === code.OK){
              this.data=rsp.list
              this.query.total=rsp.total
            }
            else 
              this.$Message.error(code.Message(rsp.code))
          }, this)
          this.$ws.call(proto.DataSources, this.query.page,this.query.size)
        },  
        //跳转到指定页
        changepage(page){
          this.query.page=page
          this.loadData() 
        },
        loadTemp(){
          this.$ws.addFunc(proto.DataOptionsRsp, function () {}, this)
          this.$ws.call(proto.DataOptions)
        }
       } ,  
       created(){ 
         this.loadColumns();
         this.loadData();
         this.loadTemp()
       }
     }
     </script> 
<style scoped>
form{padding:20px 12px;text-align: center;width:60%;margin:0 auto}
</style>