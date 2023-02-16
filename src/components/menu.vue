<template>
  <ul v-if="!collapse">
    <tree :model="item" v-for="(item,i) in items" :key="i" :selectTab="select" :loadMenu="loadMenu" :add="addChild" :edit="editChild" :del="delChild"></tree>
    <li v-if="!addNew" style="padding: 8px"><Button type="info" icon="ios-add-circle" @click="addNew=true">添加应用模块</Button></li>
    <add-menu :show="addNew" :add="addMenu" :blur="()=>{addNew=false}"></add-menu>
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
    loadMenu(){
      this.$ws.addFunc(proto.MenuListRsp,list=>{
        this.items=this.MenuListRsp(list);
      },this) 
      this.$ws.call(proto.MenuList)
    },
    initMenuItem(it, children) {
      it.children.forEach(item => {
        item.children = children[item.id]
        if (item.children && item.children.length > 0) {
          this.initMenuItem(item, children)
        }
      })
    },
    //导航栏排序 暂定
    sortList(list){
      let newL1=[],newL2=[]
      list.forEach(l=>{if(l.tid>=0)newL1.push(l);else newL2.push(l)})
      newL1.sort((a,b)=>a.id-b.id)
      newL2.sort((a,b)=>a.tid-b.tid)
      list=newL1.concat(newL2)
      return list;
    },
    MenuListRsp(list) {
      let menus={}
      list=this.sortList(list)
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
      return items;
    },
    addMenu(icon,name) {
      if (name.trim() === "") {
        return
      }
      this.addNew = false
      this.$ws.addFunc(proto.EditMenuRsp,(rsp=>{
        if (rsp.code===code.OK){
          let item={id:rsp.id,icon:icon,name:name,tid:0,toolbar: false, edit: false, add: false, fold: false,children:[]}
          this.items.push(item);
          this.items=this.sortList(this.items)
        }else{
          this.$message.error(code.Message(rsp.code))
        }
      }),this) 
      this.$ws.call(proto.EditMenu,{name:name,icon:icon})
    }, 
    addChild(icon, name, parent) {
       if (name.trim() === '') {
         return
       }
       parent.add = false
       this.$ws.addFunc(proto.EditMenuRsp, function (rsp) {
         if (rsp.code === code.OK) {
           if (!parent.children) {
             this.$set(parent, 'children', [])
           }
           let child = {id:rsp.id,name: name, icon: icon,tid:0, toolbar: false,edit: false,add: false,fold: false,children:[]}
           parent.children.push(child)
         } else {
           this.$Message.error(code.Message(rsp.code))
         }
       }, this)
       this.$ws.call(proto.EditMenu, {name: name, icon: icon, parent: parent.id})
     },
    editChild(model) {
      this.$ws.addFunc(proto.EditMenuRsp, function (rsp) {
        if (rsp.code === code.OK) {
        } else {
        this.$Message.error(code.Message(rsp.code))
        }
      }, this)
      this.$ws.call(proto.EditMenu, model)
     },
     delChild(item) {
       if (item.children && item.children.length > 0) {
         return
       }
       if (confirm(`您确认要删除 ${item.name} 吗?`)) {
        this.$ws.addFunc(proto.DeleteMenuRsp, function (rsp) {
          if (rsp === code.OK) {
            this.editMenu(this.items,item.id)
          } else {
            this.$Message.error(code.Message(rsp))
          }
        }, this)
        this.$ws.call(proto.DeleteMenu,item.id);
       }
     },
     editMenu(list,id){
      if(!list)return
      let isFind=false
        let index=list.findIndex((l) =>l.id===id);
        if(index>=0){list.splice(index,1);isFind=true;}
      if(!isFind){
        for(let i=0;i<list.length;i++){
          if(!isFind){
            list[i].children=this.editMenu(list[i].children,id)
          }
        }
      }
      return list;
    }, 
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
