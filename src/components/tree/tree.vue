<template>
  <ul>
    <child :model="item" v-for="(item,i) in items" :key="i" :onSelect="onSelect" :onEdit="onEdit" :onDel="onDel" :blur="()=>{add=false}"></child>
    <!-- <li v-if="!add" style="padding: 8px">
      <Button type="info" icon="ios-add-circle" @click="add=true">新增</Button></li> -->
    <li v-if="!add" class="add">
      <p class="btn" @click="add=true"><Icon type="ios-add-circle" size="24" />新增</p>
    </li>
    <edit :show="add" :onEdit="onEdit" :blur="()=>{add=false}" :action="0" :model="newOrg"></edit>
  </ul>
</template>
<script>
import child from "./child";
import edit from "./edit"
export default {
  name: "tree",
  props: ["onSelect","onEdit","onDel","items"],
  components: {child, edit},
  data() {
    return {add: false,newOrg:{name:'',parent:0,id:0}}
  }
}
</script>
<style scoped>
  ul{width:200px;padding-top:10px;background: #f0ecec;border-radius: 5px;min-height:500px;margin:10px}
  ul .add{height:50px;line-height:50px;text-align: center;border:none;}
  .btn{width: 100%;height:50px;line-height:50px;}
</style>
