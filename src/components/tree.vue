<template>
  <li>
    <div @mouseenter="model.toolbar=true" @mouseleave="model.toolbar=false;">
      <icon :type="model.icon" v-if="!model.edit"></icon>
      <b v-if="!model.edit" @click="select(model)">{{model.name}}</b>
      <edit-menu v-else :edit="editChild" :del="del"  :show="model.edit" :model="model"></edit-menu>
      <div class="toolbar" v-if="model.toolbar && !model.edit && model.tid>=0">
        <icon type="md-add" @click="model.add=true;model.fold=true"></icon>
        <icon type="md-create" @click="model.edit=true;model.toolbar=false"></icon>
        <icon type="md-close" v-if="!model.children || model.children.length===0" @click="del(model)"></icon>
      </div>
      <Icon :type="model.fold?'ios-arrow-down':'ios-arrow-forward'" v-if="hasChild" @click="model.fold=!model.fold" />
    </div>
    <ul v-if="hasChild || model.add" :class="{'fade':model.fold}" >
      <tree v-for="(item,k) in model.children" :model="item" :key="k" v-if="hasChild" :selectTab="selectTab" :loadMenu="loadMenu" :add="add" :edit="edit" :del="del"></tree>
      <add-menu :show="model.add" :add="add" :parent="model" :blur="()=>{model.add=false}"></add-menu>
    </ul>
  </li>
</template>
<script>
import AddMenu from "./add-menu"
import EditMenu from "./edit-menu"
 export default {
  name: "tree",
  props: ['model',"selectTab","loadMenu","add","edit","del"],
  components:{AddMenu,EditMenu},
   computed: {
     hasChild() {return this.model.children && this.model.children.length > 0}
   },
   methods: {
    select(item) {
      if (item.children&& item.children.length>0) {
        item.fold = !item.fold
      } else {
        let newItem={id:item.id,name:item.name,icon:item.icon,type:0,tid:item.tid};
        this.selectTab(newItem)
      }
    }, 
    editChild(icon, name) {
      this.model.edit = false
      if (name.trim() === '') return
      this.model.name = name
      this.model.icon = icon
      this.edit(this.model)
    }
   }
}
</script>
<style scoped>
 .fade{opacity:1;height:100%;overflow: inherit;transition-property: opacity;transition-duration:2s;}
  ul{opacity:0;height:0px;overflow: hidden;transition-duration:2s;transition-property: opacity;margin-left:20px}
  .toolbar{border-radius: 8px;border:1px solid #525a6c;margin-right: 8px;display: flex;flex-direction: row}
  .toolbar>i{width: 20px;text-align: center;border-right: 1px solid #525a6c;flex: 1}
  .toolbar>i:last-child{border: 0}
</style>
