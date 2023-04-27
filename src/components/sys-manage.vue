<template>
    <!-- 系统管理 -->
    <div>
        <!-- 系统管理  主页面 -->
        <ul v-if="tab.type==0">
            <li v-for="t in homeTabs" :key="t.type" span="3" @click="showPage(t)">
                <div><Icon :type="t.icon" size="70"/><br>
                <b>{{ t.name }}</b>  </div>
            </li> 
        </ul>
        <!-- 职能组 -->
        <operation-group v-else-if="tab.type==4"></operation-group>
        <!-- 工作台 -->
        <home v-else-if="tab.type==1"></home>
        <!-- 系统配置 主页面 -->
        <ul v-else-if="tab.type==2">
            <li  v-for="t in settingTabs" :key="t.type" span="3" @click="showPage(t)">
                <div><Icon :type="t.icon" size="70"/><br>
                <b>{{ t.name }}</b>  </div>
            </li> 
        </ul>
        <!-- 组织机构 -->
        <organization v-else-if="tab.type==5"></organization>
        <!-- <flowchart v-else-if="tab.type==6"></flowchart> -->
        <flow-setting v-else-if="tab.type==6"></flow-setting>
        <!-- 系统配置 子页面 -->
        <!-- 系统预设数据源 -->
        <setting-data v-else-if="tab.type==11"></setting-data>
        <!-- 员工扩展信息 -->
        <div v-else-if="tab.type==12">
            <form-design v-if="designTemplate" :type=1 :template="designTemplate"></form-design>
        </div>
        <div v-else-if="tab.type==13">
           <test></test>
        </div>
    </div>
</template>
<script>
import Home from "../components/home";
import Flowchart from '../components/flow-chart';
import SettingData from "../components/setting-data";
import FlowSetting from "../components/flow-setting";
import FormDesign from './form-design.vue';
import proto from "../logic/proto"
import code from "../logic/code"
import widget from "../logic/custom-widget";
import Organization from "./organization.vue";
import OperationGroup from "./operation-group.vue";

export default {
    name:"SysManage",
    components:{Organization, Flowchart,Home,SettingData,FormDesign,OperationGroup,FlowSetting},
    props:['tab','setTab'],
    data(){
        return {
            homeTabs:[{type:1,name:"工作台",icon:"ios-home"},
                {type:2,name:"系统配置",icon:"ios-pricetags"},
                {type:5,name:"组织机构",icon:"ios-list"},
                {type:3,name:"角色管理",icon:"ios-people"},
                {type:4,name:"受理组",icon:"ios-calendar"},
                {type:6,name:"流程配置",icon:"ios-calendar-outline"},
                {type:13,name:"测试",icon:"ios-calendar-outline"}
            ],
            settingTabs:[{type:7,name:"公司名称LOGO",icon:"ios-apps"},
                {type:8,name:"License授权",icon:"ios-albums"},
                {type:9,name:"登录日志",icon:"ios-book"},
                {type:10,name:"操作日志",icon:"ios-brush"},
                {type:11,name:"基础数据源",icon:"ios-build"},
                {type:12,name:"员工扩展信息",icon:"ios-people"}],
            designTemplate:{},employeeTId:0
      }
    },
    methods:{
        showPage(t){
            this.setTab({id:this.tab.id,name:this.tab.name+"/"+t.name,
            icon:this.tab.icon,type:t.type,tid:this.tab.tid});
        },
        //保存员工扩展信息模板数据
        saveTemp(tId,forms,atomicId,layout,clear){
            let dbTemplates =widget.parseTo(forms)
            let layoutInfo=JSON.stringify(layout.grid)
            this.$ws.addFunc(proto.EditTemplateInfoRsp, function (rsp) {
                if (rsp.code === code.OK)
                    this.$Message.info("保存成功");
                else
                    this.$Message.error(code.Message(rsp.code))
                }, this)
            this.$ws.call(proto.EditTemplateInfo,tId,dbTemplates,atomicId,layoutInfo,1,"",clear);
        }
    }
}
</script>
<style scoped>
ul{padding: 8px;display: flex;flex-direction: row;}
ul>li{margin:30px}
ul>li>div{width:100px;line-height:40px;text-align: center;border-radius: 5px;background-color: #F2F3F7;cursor: pointer;}
ul>li>div:hover{border:1px solid #50a4e0}
ul>li>.ivu-icon{height:60px;display:block;}

.ul{width:200px}

.ul div{height: 50px;line-height: 50px;text-align: center}
.ul div:hover{background: gray;}
</style>