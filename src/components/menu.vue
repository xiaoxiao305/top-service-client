<template>
  <ul v-if="!collapse">
    <tree :model="item" v-for="(item,i) in items" :key="i" :selectTab="select" :loadMenu="loadMenu"></tree>
    <li v-if="!addNew" style="padding: 8px"><Button type="info" icon="ios-add-circle" @click="addNew=true">添加组织架构</Button></li>
    <add-menu :show="addNew" :add="add" :blur="()=>{addNew=false}"></add-menu>
  </ul>
  <ul v-else class="collapse">
    <!--todo 菜单折叠 -->
    <li v-for="(item,i) in items" :key="i" >
      <icon :type="item.icon"  size="20" @click="showDrawer(item)"></icon>
    </li>
    <Drawer :title="drawer.name" placement="left" :closable="false"  v-model="drawer.show" >
      <Tree :data="drawer.data"></Tree>
    </Drawer>
  </ul>
</template>
<script>
import tree from "./tree";
import AddMenu from "./add-menu"
import proto from "../logic/proto"
import code from "../logic/code"
export default {
  name: "tree-menu",
  props: ['collapse',"select"],
  components: {tree, AddMenu},
  data() {
    return {
      items: [],
      addNew: false,
      drawer:{
        show:false,
        data:[],
        name:""
      },
    }
  },

  methods: {
    showDrawer(item){
      if (item.children && item.children.length>0) {
        this.drawer.show = true
        this.drawer.name = item.name
        let data=[]
        let doChild=function (it){
          let child={title:it.name,id:it.id,icon:it.icon}
          child.render=function (h, { root, node, data }){return h('span', [h('Icon', {props: {type: data.icon}}),data.title])}
          if (it.children && it.children.length>0){
            child.expand=true
            child.children=[]
            recursion(child,it.children)
          }
          return child
        }
        let recursion=function (obj,children){children.forEach(it=>{obj.push(doChild(it))})}
        item.children.forEach(it=>{data.push(doChild(it))})
        this.drawer.data = data
      }
    },
    add(icon,name) {
      this.addNew = false
      if (name.trim() === "") {
        return
      }
      this.$ws.addFunc(proto.EditMenuRsp,(rsp=>{
        if (rsp.code===code.OK){
          this.items.push({id:rsp.id,icon:icon,name:name,tid:0,toolbar: false, edit: false, add: false, fold: false,children:[]})
        }else{
          this.$message.error(code.Message(rsp.code))
        }
      }),this)
     this.$ws.call(proto.EditMenu,{name:name,icon:icon})
    },
    initMenuItem(it, children) {
      it.children.forEach(item => {
        item.children = children[item.id]
        if (item.children && item.children.length > 0) {
          this.initMenuItem(item, children)
        }
      })
    },
    MenuListRsp(list) {
      let menus={}
      list.forEach(item=>{menus[item.id]=item})
      store["menu"]=JSON.stringify(menus)
      let items = []
      let children = {}
      list.forEach(item => {
        item = Object.assign(item, {toolbar: false, edit: false, add: false, fold: false,children:[]})
        if (item.parent === 0) {
          items.push(item)
        } else {
          if (!children[item.parent]) {
            children[item.parent] = []
          }
          children[item.parent].push(item)
        }
      })
      items.forEach(it => {
        if (children[it.id]) {
          it.children = children[it.id]
          if (it.children.length > 0) this.initMenuItem(it, children)
        }
      })
      this.items = items
    },
    loadMenu(){
      console.log("menu this.$ws:",this)
      this.$ws.addFunc(proto.MenuListRsp,this.MenuListRsp,this)
      this.$ws.call(proto.MenuList)
    }
  },
  created() {
    this.loadMenu()
  }
}
</script>
<style scoped>
.collapse{transition-property:opacity;transition-duration:0.5s;opacity: 1;}
.collapse>li{text-align: center;height:40px;line-height:40px}
</style>
