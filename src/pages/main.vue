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
              <list ref="list" :setTab="setTab" :menu="tab"></list>
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
import SysManage from "../components/sys-manage"; 

export default {
  name: "Main",
  components:{TreeMenu,Header,List,SysManage},
  data() {
     return {
      hideMenu:false,
      theme:"dark",
      tabs:[],
      tabId:"0_0",//id_type 

      tabOrderIds:[]
    }
  },
  methods: {
    getTabKey(id,type){
      return id.toString()+"_"+type.toString();
    },
    setTab(item){
      if(!item || item.id<1)return;
      this.tabId=this.getTabKey(item.id,item.type);
      let exists=false
      for (let i=0;i<this.tabs.length;i++) {
        if (this.getTabKey(this.tabs[i].id,this.tabs[i].type)===this.getTabKey(item.id,item.type)) {
          this.tabs[i].tid=item.tid;
          this.tabs[i].did=item.did
          exists=true
          break
        }
      }
      if(!exists)this.tabs.push(item)
      this.switchTab();
    },
    switchTab(){
      //将当前选中tab移动到最后一位
      let index = this.tabOrderIds.findIndex(order => order==this.tabId);
      if (index>=0)this.tabOrderIds.splice(index,1)
      this.tabOrderIds.push(this.tabId);
      //编辑页面和数据后，刷新主页面
      // let id=parseInt(this.tabId.split('_')[0]);
      // let type=parseInt(this.tabId.split('_')[1]);
      // if(id<1 || type !=0)return;
      // let tab=this.tabs.find(t=>{if(t.id==id)return t})
      // let rs=this.$refs['list']
      // if(rs && rs.length>0){
      //   rs[0].loadTemp(tab.tid)
        // rs[0].loadData(tab.tid)
      // }
     },
    closeTab(id){
      let index = this.tabs.findIndex(tab => (this.getTabKey(tab.id,tab.type))==id);
      if (index>=0)this.tabs.splice(index,1)
      let orderId = this.tabOrderIds.findIndex(order => order==id);
      if (orderId>=0)this.tabOrderIds.splice(orderId,1)
      this.tabId=-1//关闭时，返回上一个打开tab
      if (this.tabs.length>0)
        this.tabId=this.tabOrderIds[this.tabOrderIds.length-1]
      else
        this.tabOrderIds=[];
    },    
  },
}
</script>
<style scoped>
.row div{width:80px;height:80px;border:1px solid black}
.menu ul li>div:hover{background-color: #1F2D3D;cursor: pointer;}
.menu ul li>div b:active{background-color:#001528}
.menu ul li>div b:focus{background-color:#001528}

</style>
