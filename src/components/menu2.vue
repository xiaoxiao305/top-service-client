<template>
    <ul>
      <tree :model="item" v-for="(item,i) in items" :key="i" :select="select" :loadMenu="loadMenu"></tree>
      <li v-if="!addNew" style="padding: 8px"><Button type="info" icon="ios-add-circle" @click="addNew=true">添加机构</Button></li>
      <add-menu :show="addNew" :add="add" :blur="()=>{addNew=false}"></add-menu>
    </ul>
  </template>
  <script>
  import tree from "./tree2";
  import AddMenu from "./add-menu2"
  import proto from "../logic/proto"
  import code from "../logic/code"
  export default {
    name: "menu2",
    props: ["select"],
    components: {tree, AddMenu},
    data() {
      return {
        items: [],
        addNew: false,
      }
    },
  
    methods: {
      add(icon,name) {
        this.addNew = false
        if (name.trim() === "") {
          return
        }
        //暂定
      //   this.$ws.addFunc(proto.EditMenuRsp,(rsp=>{
      //     if (rsp.code===code.OK){
      //       this.items.push({id:rsp.id,icon:icon,name:name,tid:0,toolbar: false, edit: false, add: false, fold: false,children:[]})
      let obj={icon:icon,name:name,tid:0,toolbar: false, edit: false, add: false, fold: false,children:[]}
      let objs=store["partUsers"]?JSON.parse(store["partUsers"]):[]
      obj.id=store["maxUserId"]?parseInt(store["maxUserId"])+1:objs.length+1;
      store["maxUserId"]=obj.id;
      console.log("this is add1 objs:",objs," obj:",obj)
      objs.push(obj);
      store["partUsers"]=JSON.stringify(objs);
      this.items.push(obj)
      //     }else{
      //       this.$message.error(code.Message(rsp.code))
      //     }
      //   }),this)
      //  this.$ws.call(proto.EditMenu,{name:name,icon:icon})
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
        console.log("MenuListRsp list :",list)
        let menus={}
        list.forEach(item=>{menus[item.id]=item})
        store["partmenu"]=JSON.stringify(menus)
        let items = []
        let children = {}
        list.forEach(item => {
          item = Object.assign(item, {toolbar: false, edit: false, add: false, fold: false,children:[]})
          if (!item.parent || item.parent === 0) {
            items.push(item)
          } else {
            if (!children[item.parent]) {
              children[item.parent] = []
            }
            children[item.parent].push(item)
          }
        })
        console.log("MenuListRsp items:",items)
        items.forEach(it => {
          if (children[it.id]) {
            it.children = children[it.id]
            if (it.children.length > 0) this.initMenuItem(it, children)
          }
        })
        this.items = items
      },
      loadMenu(){
        //暂定
        // this.$ws.addFunc(proto.MenuListRsp,this.MenuListRsp,this)
        // this.$ws.call(proto.MenuList)
        let objs=store["partUsers"]?JSON.parse(store["partUsers"]):[]
        console.log("loadmenu objs:",objs)
        this.MenuListRsp(objs)
      }
    },
    created() {
// store["partUsers"]=[]
//       store["maxUserId"]=0
      this.loadMenu()
    }
  }
  </script>
  <style scoped>
  .collapse{transition-property:opacity;transition-duration:0.5s;opacity: 1;}
  .collapse>li{text-align: center;height:40px;line-height:40px}
  </style>
  