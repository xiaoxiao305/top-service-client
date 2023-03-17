<template>
  <li class="add" v-if="show">
    <input style="background-color:white !important;opacity: 0.8;color: black;" v-model="name" @keyup.enter="onEdit(name,parent,action,id)" @blur="blur"/>
    <icon type="md-checkmark" @click="onEdit(name,parent,action,id)"></icon>
  </li>
</template>
<script>
export default {
  name: "Edit",
  props:{
    show:Boolean,
    onEdit:Function,
    model:Object,
    blur:Function,
    action:Number
  },
  data(){
    return {
      name:this.model.name,
      parent:this.model.parent,
      id:this.model.id
    }
  },created(){
    if(this.action==0 && this.model.id>0){//添加子选项
      this.parent=this.model.id
      this.id=0
    }
  },
  directives: {
    drag: {
      bind(el) {
        let org = el;
        el.onmousedown = (e) => {
          let x = e.clientX - org.offsetLeft, y = e.clientY - org.offsetTop;
          let left = '', top = '';
          document.onmousemove = (e) => {
            let dw = document.body.clientWidth - 240, dh = document.body.clientHeight - 240;
            left = (e.clientX - x) > dw ? dw : e.clientX - x
            top = (e.clientY - y) > dh ? dh : e.clientY - y
            top = top < 0 ? 0 : top
            left = left < 0 ? 0 : left
            org.style.left = left + "px"
            org.style.top = top + 'px'
          }
          document.onmouseup = (e) => {
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  }
}
</script>
<style>
/* .add input{background: red !important;} */
</style>
