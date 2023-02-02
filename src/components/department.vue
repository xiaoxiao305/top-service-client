<template>
    <div>
        <tree-menu :select="loadPartUsers"></tree-menu>
        <Button type="primary" @click="showPage=true">添加员工</Button>
        <Modal
            v-model="showPage"
            title="添加员工" style="line-height:40px"
            >
            账号：<Input v-model="user.acc" placeholder="请输入账号" style="width:50%;line-height:50px"/>
            <br/>密码：<Input v-model="user.acc" type="password" placeholder="请输入密码" style="width:50%;line-height:50px"/>
            <Data :menu="part"  :loadData="loadTemplateData"></Data>
        </Modal>
    </div>
</template>
<script>
import TreeMenu from "../components/menu2";
import Data from "../components/data";
import widget from "../logic/widget"

export default ({
    components:{TreeMenu,Data},
    data(){
        return{
            showPage:false,
            part:{},user:{}
        }
    },
    methods:{
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
