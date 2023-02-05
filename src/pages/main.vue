<template>
  <div :class="['layout',theme]">
    <Header></Header>
    <div>
      <div :class="['menu',{'collapse':hideMenu}]">
        <tree-menu :collapse="hideMenu" :select="setTab"></tree-menu>
      </div>
      <div class="content">
        <Tabs type="card" closable @on-click="switchTab" v-model="tabId" @on-tab-remove="closeTab" :animated="false">
          <TabPane v-for="tab in tabs" :label="tab.name" :icon="tab.icon" :name="tab.id.toString()+'_'+tab.type.toString()" :key="tab.id.toString()+'_'+tab.type.toString()">
            <template v-if="tab.tid == -1">
              <sys-manage :tab="tab" :setTab="setTab"></sys-manage>
            </template>
            <template v-else>
              <design v-if="tab.type==1||tab.type==3" :menu="tab" :setTab="setTab"></design>
              <Data v-else-if="tab.type==2" :menu="tab" :setTab="setTab" :loadData="loadTemplateData"></Data>
              <!-- 表单测试 暂定 -->
              <form-design v-else-if="tab.type==100" :menu="tab" :setTab="setTab"></form-design> 
              <list v-else :setTab="setTab" :menu="tab" :templates="dbTemplates" :templatesData="dbTemplatesData"></list>

            </template>
          </TabPane>
        </Tabs> 
      </div>
    </div>
  </div>
</template>
<script>
import Header from "../components/header";
import TreeMenu from "../components/menu";
import List from "../components/list";
import Design from "../components/design";
import Data from "../components/data";
import widget from "../logic/widget"
import SysManage from "../components/sys-manage"; 
import FormDesign from "../components/form-design"; 

export default {
  name: "Main",
  components:{TreeMenu,Header,List,Design,Data,SysManage,FormDesign},
  data() {
     return {
      hideMenu:false,
      theme:"dark",
      tabs:[],
      tabId:"0_0",//id_type
      dbTemplates:[],
      dbTemplatesData:[],

      tabOrderIds:[]
    }
  }, 
  methods: {   
    setTab(item){
      if(!item || item.id<1)return;
      this.tabId=item.id.toString()+"_"+item.type.toString();
      let exists=false
      for (let i=0;i<this.tabs.length;i++) {
        if (this.tabs[i].id.toString()+"_"+this.tabs[i].type.toString() === item.id.toString()+"_"+item.type.toString()) {
          this.tabs[i].tid=item.tid;
          this.tabs[i].did=item.did
          exists=true
          break
        }
      } 
      if(!exists)this.tabs.push(item)
      this.switchTab(this.tabId);
    },
    switchTab(id){
      let index = this.tabOrderIds.findIndex(order => order==id);
      if (index>=0)this.tabOrderIds.splice(index,1)
      this.tabOrderIds.push(id);
      let tid=parseInt(id.split('_')[0]);
      let type=parseInt(id.split('_')[1]);
      if(tid<1 || type !=0)return;
      this.loadTemplateInfo(tid);
      if(this.dbTemplates && this.dbTemplates.length>0)
        this.loadTemplateData(tid) 
    },
    closeTab(id){
      let index = this.tabs.findIndex(tab => (tab.id.toString()+"_"+tab.type.toString())==id);
      if (index>=0)this.tabs.splice(index,1)
      let orderId = this.tabOrderIds.findIndex(order => order==id);
      if (orderId>=0)this.tabOrderIds.splice(orderId,1)
      this.tabId=-1
      if (this.tabs.length>0)
        this.tabId=this.tabOrderIds[this.tabOrderIds.length-1]
      else
        this.tabOrderIds=[];
    },
    async loadTemplateInfo(tid){
      this.dbTemplates=await widget.loadTemplateInfo(tid);
    },
    async loadTemplateData(tid){      
      this.dbTemplatesData=await widget.loadTemplateData(tid,1,10); 
    }
  }, 
}
</script>
<style scoped>
.row div{width:80px;height:80px;border:1px solid black}
</style>