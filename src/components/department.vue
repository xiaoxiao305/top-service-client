<template>
    <div>
        <tree-menu :select="loadPartUsers" style="width:10%;float: left;border-right: 1px solid gray;margin:2%"></tree-menu>
        <Modal
            v-model="showPage" @on-ok="add"
            title="添加员工" style="line-height:40px"
            >
            账号：<Input v-model="user.acc" placeholder="请输入账号" style="width:50%;line-height:50px"/>
            <br/>密码：<Input v-model="user.pwd" type="password" placeholder="请输入密码" style="width:50%;line-height:50px"/>
            <Data :menu="part" ref="userData"  :loadData="loadTemplateData"></Data>
        </Modal>
        <div style="width:80%;float:left">
            <Button type="primary" @click="showPage=true">添加员工</Button>
            <Table :columns="columns" :data="data"></Table>
        </div>
    </div>
</template>
<script>
import TreeMenu from "../components/menu2";
import Data from "../components/data";
import widget from "../logic/widget";
import proto from "../logic/proto"
import code from "../logic/code"

export default ({
    components:{TreeMenu,Data},
    data(){
        return{
            showPage:false,
            part:{},user:{},
            columns:[{title:'账号',key:"acc"},{title:"密码",key:"pwd"}],data:[]
        }
    },
    created(){
        
        this.loadUserList();
    },
    methods:{
        add(){
            store["userBaseInfo"]=JSON.stringify(this.user);
            this.$refs.userData.saveData();
            this.loadUserList();
        },
        async loadUserList(){
            this.columns=[{title:'账号',key:"acc"},{title:"密码",key:"pwd"}];
            let dbTemplates=await widget.loadTemplateInfo(12)
            console.log("temp dbTemplates:",dbTemplates)
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
                        this.part.did=params.row.id
                       this.showPage=true
                       console.log("this.part:",this.part)
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


this.data=[];
            let t=await widget.loadTemplateData(12,1,10)
            t[0].acc="111"
            t[0].pwd="2"
            this.data=t;
            console.log("depart data:",this.data)
        },
        loadPartUsers(part){
            console.log("this isloadUsers id:",part)
            part.tid=12;
            this.part=part;
        },
        addUser(){

        },
        async loadTemplateData(tid){
            console.log("this.department:",tid)
            this.dbTemplatesData=await widget.loadTemplateData(tid,1,10); 
        }

    }
})
</script>
