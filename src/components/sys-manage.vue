<template>
    <!-- 系统管理 -->
    <div>{{ tab }}
        <!-- 系统管理  本页面 -->
        <Row v-if="tab.type==0">
            <Col v-for="t in tabs" :key="t.type" span="3">
            <div @click="showPage(t)" style="width:100px;line-height:40px;text-align: center;border-radius: 5px;background-color: #F2F3F7;cursor: pointer;">
            <Icon :type="t.icon" style="height:60px;display:block;" size="70"/>
            <b>{{ t.name }}</b>
            </div>
            </Col> 
        </Row>
        <!-- 工作台 -->
        <home v-else-if="tab.type==1"></home>
        <!-- 系统配置 本页面 -->
        <Row v-else-if="tab.type==2">
            <Col v-for="t in tabs2" :key="t.type" span="3">
                <div @click="showPage(t)" style="width:100px;line-height:40px;text-align: center;border-radius: 5px;background-color: #F2F3F7;cursor: pointer;">
                <Icon :type="t.icon" style="height:60px;display:block;" size="70"/>
                <b>{{ t.name }}</b>
                </div>
            </Col> 
        </Row>
        <!-- 组织机构 -->
        <department v-else-if="tab.type==5"></department>
        <flowchart v-else-if="tab.type==6"></flowchart>
        <!-- 系统配置 子页面 -->
        <!-- 系统预设数据源 -->
        <setting-data v-else-if="tab.type==11"></setting-data>
        <!-- 员工扩展信息 -->
        <design v-else-if="tab.type==12" :menu="tab" :setTab="setTab"></design>
    </div>
</template>
<script> 
import Home from "../components/home"; 
import Flowchart from '../pages/flowchart';
import SettingData from "../components/setting-data";
import Design from "../components/design";
import Department from "../components/department";


export default {
    name:"SysManage",
    components:{Flowchart,Home,SettingData,Design,Department},
    props:['tab','setTab'],
    data(){
        return {
            tabs:[{type:1,name:"工作台",icon:"ios-home"},
                {type:2,name:"系统配置",icon:"ios-pricetags"},
                {type:5,name:"组织机构",icon:"ios-list"},
                {type:3,name:"角色管理",icon:"ios-people"},
                {type:4,name:"受理组",icon:"ios-calendar"},
                {type:6,name:"流程配置",icon:"ios-calendar-outline"}],
            tabs2:[{type:7,name:"公司名称LOGO",icon:"ios-apps"},
                {type:8,name:"License授权",icon:"ios-albums"},
                {type:9,name:"登录日志",icon:"ios-book"},
                {type:10,name:"操作日志",icon:"ios-brush"},
                {type:11,name:"基础数据源",icon:"ios-build"},
                {type:12,name:"员工扩展信息",icon:"ios-people"}]
      }
    },
    methods:{
        showPage(t){ 
            this.setTab({id:this.tab.id,name:this.tab.name+"/"+t.name,
            icon:this.tab.icon,type:t.type,tid:this.tab.tid});
        }
    }
}
</script>
