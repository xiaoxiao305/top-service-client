<template>
    <!--系统管理 仪表盘设置 -->
    <div>
        <Button @click="showModal=true" type="primary">新建窗体</Button>
        <Modal
            v-model="showModal"
            title="添加仪表盘" @on-ok="addBoard">
            <div style="line-height:40px;">
            名 称：<Input v-model="name" placeholder="请输入仪表盘名称" style="width:90%;"></Input>
            类 型：
            <Radio-group v-model="type" @on-change="typeChange">
                <Radio v-for="t in types" :label="t" :key="t">
                    <span>{{t==1?'列表':t==2?'柱状图':'饼状图'}}</span>
                </Radio> 
            </Radio-group><br/>
            数据源：
            <Dropdown @on-click="itemClick">
                <a href="javascript:void(0)">{{fatherText}}
                    <Icon type="ios-arrow-down"></Icon>
                </a>
                <drop-down-item slot="list" :parent="fatherList" placement="right-start" icon="ios-arrow-forward"></drop-down-item>
            </Dropdown><br/>
            列 数：
            <Radio-group v-model="persent" @on-change="persentChange">
                <Radio v-for="r in persents" :label="r" :key="r" >
                    <span>{{r}}列</span>
                </Radio> 
            </Radio-group></div>
        </Modal>
        <div style="display: block;">
        <card-item v-for="b in cardList" :key="b.name" :card="b"></card-item></div>
    </div>
</template>
<script> 
import dropDownItem from '../components/drop-down-item'
import proto from "../logic/proto" 
import cardItem from '../components/card-item'
    export default {
        components:{dropDownItem,cardItem},
        data () {
            return {
                showModal:false,
                fatherList:[],fatherText:"数据源列表",
                name:"",type:1,types:[1,2,3],source:"",persent:1,persents:[1,2,3,4],
                cardList: [], 
            }
        }, 
        methods: { 
            addBoard(){
                let board={name:this.name,type:this.type,source:this.source,persent:this.persent}
                let boards=store["boards"]?JSON.parse(store["boards"]):[];
                boards.push(board);
                this.cardList=boards;
                store["boards"]=JSON.stringify(boards);
            },
            typeChange(obj){
                this.type=obj;
            },
            persentChange(obj){
                this.persent=obj;
            },
            itemClick(name){
                this.source=name;
            }, 
            MenuRsp(rsp) { 
                if(!rsp || rsp.length<1)return;
                const res = []
                const obj = {}
                rsp.forEach(item => {obj[item.id] = item})
                rsp.forEach(item => {
                    if(item.tid>=0){
                        const parent = obj[item.parent]
                        if (parent) (parent.children || (parent.children = [])).push(item)
                        else res.push(item)
                    }
                })
                this.fatherList=res;
            } 
        },
        created(){
            //cardlist
            let boards=store["boards"]?JSON.parse(store["boards"]):[];
            this.cardList=boards;
        
            //menu-->source
            this.$ws.addFunc(proto.MenuListRsp,this.MenuRsp,this)
            this.$ws.call(proto.MenuList)
        }, 
    }
</script> 