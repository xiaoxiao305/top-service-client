<template>
    <li style="line-height:40px;">
      <div @mouseenter="model.toolbar=true" @mouseleave="model.toolbar=false;">
        <icon :type="model.icon" v-if="!model.edit"></icon>
        <b v-if="!model.edit" @click="selectPage(model)">{{model.name}}</b>
        <edit-menu v-else :edit="edit"  :show="model.edit" :model="model"></edit-menu>
        <div class="toolbar" v-if="model.toolbar && !model.edit && model.tid>=0">
          <icon type="md-add" @click="model.add=true;model.fold=true"></icon>
          <icon type="md-create" @click="model.edit=true;model.toolbar=false"></icon>
          <icon type="md-close" v-if="!model.children || model.children.length===0" @click="del(model)"></icon>
        </div>
        <Icon :type="model.fold?'ios-arrow-down':'ios-arrow-forward'" v-if="hasChild" @click="model.fold=!model.fold" />
      </div>
      <ul v-if="hasChild || model.add" :class="{'fade':model.fold}" >
        <tree v-for="(item,k) in model.children" :model="item" :key="k" v-if="hasChild" :select="select" :loadMenu="loadMenu"></tree>
        <add-menu :show="model.add" :add="add" :parent="model" :blur="()=>{model.add=false}"></add-menu>
      </ul>
    </li>
  </template>
  <script>
  import AddMenu from "./add-menu2"
  import EditMenu from "./edit-menu2"
  import proto from "../logic/proto"
  import code from "../logic/code"
   export default {
    name: "tree2",
    props: ['model',"select","loadMenu"],
    components:{AddMenu,EditMenu},
     data() {
        return {}
     },
     computed: {
       hasChild() {return this.model.children && this.model.children.length > 0}
     },
     methods: {
      selectPage(item) {
        if (item.children&& item.children.length>0) {
          item.fold = !item.fold
        } else {
            let newItem={id:item.id,name:item.name,icon:item.icon,type:0,tid:item.tid};
            this.select(newItem)
        }
      }, 
      setSore(list,model,parent){
        let isFind=false;
        for(let i =0;i<list.length;i++){
          if(list[i].id==parent.id){
            if(list[i].children)
              list[i].children.push(model);
            else
              {list[i].children=[];list[i].children.push(model);console.log("setsore children:",list[i].children)}
            isFind=true
          }
        }
        if(!isFind){
          for(let i =0;i<list.length;i++){
            if(!list[i].children || list[i].children.length<1)continue;
            for(let j=0;j<list[i].children.length;j++){
              list[i].children=this.setSore(list[i].children,model,parent)
            }
          }
        }
        return list;
      },
       add(icon, name, parent) {
        console.log("this is tree2.add",icon,name,parent)
         parent.add = false
         if (name.trim() === '') {
           return
         }
         //暂定
        //  this.$ws.addFunc(proto.EditMenuRsp, function (rsp) {
        //    if (rsp.code === code.OK) {
             if (!parent.children) {
               this.$set(parent, 'children', [])
             }
        //      let child = {id:rsp.id,name: name, icon: icon,tid:0, toolbar: false,edit: false,add: false,fold: false,children:[]}
        //      parent.children.push(child)
        let child= {name: name, icon: icon,tid:0, toolbar: false,edit: false,add: false,fold: false,children:[]}
      let objs=store["partUsers"]?JSON.parse(store["partUsers"]):[]
      console.log("max:",store["maxUserId"])
      child.id=store["maxUserId"]?parseInt(store["maxUserId"])+1:objs.length+1;
      store["maxUserId"]=child.id;
      console.log("max2:",store["maxUserId"])
      objs=this.setSore(objs,child,parent)
      console.log("after add newObjs:",objs," str:",JSON.stringify(objs))

      store["partUsers"]=JSON.stringify(objs);
      parent.children.push(child)


        //    } else {
        //      this.$Message.error(code.Message(rsp.code))
        //    }
        //  }, this)       
        //  this.$ws.call(proto.EditMenu, {name: name, icon: icon, parent: parent.id})
       },
       del(item) { 
         if (item.children && item.children.length > 0) {
           return
         }          
         if (confirm(`您确认要删除 ${item.name} 吗?`)) {
          // this.$ws.addFunc(proto.DeleteMenuRsp, function (rsp) {
          //   if (rsp === code.OK) {
          //     this.loadMenu();
          //暂定
          let objs=store["partUsers"]?JSON.parse(store["partUsers"]):[]
        let newObjs=objs.filter(o=>{if(o.id!=this.model.id)return o;})
        console.log("del objs:",newObjs)
        store["partUsers"]=JSON.stringify(newObjs)
        this.loadMenu();
          //   } else {
          //     this.$Message.error(code.Message(rsp))
          //   }
          // }, this)
          // this.$ws.call(proto.DeleteMenu,item.id);
         }
       },
       edit(icon, name) {
         this.model.edit = false
         if (name.trim() === '') {
           return
         }
         this.model.name = name
         this.model.icon = icon
         //暂定
        //  this.$ws.addFunc(proto.EditMenuRsp, function (rsp) {
        //    if (rsp.code === code.OK) {
        //    } else {
        //      this.$Message.error(code.Message(rsp.code))
        //    }
        //  }, this)
        //  this.$ws.call(proto.EditMenu, this.model)
        let objs=store["partUsers"]?JSON.parse(store["partUsers"]):[]
        let newObjs=objs.map(o=>{if(o.id==this.model.id)o=this.model;return o;})
        console.log("edit objs:",newObjs)
        store["partUsers"]=JSON.stringify(newObjs)
     
       }
     }
  }
  </script>
  <style scoped>
   .fade{opacity:1;height:100%;overflow: inherit;transition-property: opacity;transition-duration:2s;}
    ul{opacity:0;height:0px;overflow: hidden;transition-duration:2s;transition-property: opacity;margin-left:20px}
    .toolbar{border-radius: 8px;border:1px solid #525a6c;margin-right: 8px;display: flex;flex-direction: row;}
    .toolbar>i{width: 20px;text-align: center;border-right: 1px solid #525a6c;flex: 1}
    .toolbar>i:last-child{border: 0}
  </style>
  