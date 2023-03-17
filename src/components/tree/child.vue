<template>
  <li>
    <div class="item" @mouseenter="model.toolbar=true" @mouseleave="model.toolbar=false;">
      <b v-if="!model.edit" @click="select(model)" style="display: inline-block;height: 40px;line-height: 40px;">{{model.name}}</b>
      <edit v-else :onEdit="onEdit" :onDel="onDel" :show="model.edit" :model="model" :action="1" :blur="()=>{model.add=false}"></edit>
      <div class="toolbar" v-if="model.toolbar && !model.edit">
        <icon type="md-add" @click="model.add=true;model.fold=true"></icon>
        <icon type="md-create" @click="model.edit=true;model.toolbar=false"></icon>
        <icon type="md-close" v-if="!model.children || model.children.length===0" @click="onDel(model)"></icon>
      </div>
      <Icon :type="model.fold?'ios-arrow-down':'ios-arrow-forward'" v-if="hasChild" @click="model.fold=!model.fold" />
    </div>
    <ul v-if="hasChild || model.add" :class="{'fade':model.fold}" >
      <child v-for="(item,k) in model.children" :model="item" :key="k"
       v-if="hasChild" :onSelect="onSelect" :onEdit="onEdit" :onDel="onDel" :blur="()=>{model.add=false}"></child>
      <edit :show="model.add" :onEdit="onEdit" :onDel="onDel" :model="model" :blur="()=>{model.add=false}" :action="0"></edit>
    </ul>
  </li>
</template>
<script>
import edit from "./edit"
export default {
  name: "child",
  props: ['model',"onSelect","onEdit","onDel"],
  components:{edit},
  data() {
    return {}
  },methods:{
    select(item) {
      if (item.children&& item.children.length>0) {
        item.fold = !item.fold
      } else
        this.onSelect(item)
    }
  },
  computed: {
    hasChild() {return this.model.children && this.model.children.length > 0}
  }
}
</script>
<style scoped>
  .fade{opacity:1;height:100%;overflow: inherit;transition-property: opacity;transition-duration:2s;padding-left: 10px;}
  ul{opacity:0;height:0px;overflow: hidden;transition-duration:2s;transition-property: opacity;}
  .item{height: 50px;line-height: 50px;padding-left:10px}
  .item:hover{background: #fcfcfd;}
 

  .toolbar{margin-right: 8px;display: flex;flex-direction: row}
  .toolbar>i{width: 20px;text-align: center; flex: 1} 
</style>
