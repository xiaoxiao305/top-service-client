<template>
  <li class="add" v-if="show" >
    <icon :type="icon" @click="showIcon=true" ></icon>
    <input v-model="name" :placeholder="$t('input')" @keyup.enter="edit(icon,name)"></input>
    <icon type="md-checkmark" @click="edit(icon,name)"></icon>
    <div class="icon-list" v-drag v-if="showIcon">
      <div><b>请选择图标</b><icon type="md-close" @click="showIcon=false"></icon></div>
      <icon v-for="(ico,i) in icons" :type="ico" :key="i" @click="icon=ico;showIcon=false"></icon>
    </div>
  </li>
</template>
<script>
export default {
  name: "EditMenu",
  props:{
    show:false,
    edit:Function,
    model:Object,
    blur:Function
  },
  data(){
    return {
      icon:this.model.icon,
      name:this.model.name,
      showIcon:false,
      icons: [
        "md-settings",
        "ios-settings",
        "ios-stats",
        "ios-pie",
        "md-pulse",
        "ios-pulse",
        "md-stats",
        "md-text",
        "md-person",
        "ios-ribbon",
        "ios-school",
        "md-podium",
        "ios-podium",
        "md-pricetag",
        "md-list",
        "ios-list-box",
        "md-list-box",
        "ios-albums",
        "md-photos",
        "md-people",
        "ios-paper",
        "md-albums",
        "md-analytics",
        "ios-bookmark",
        "ios-cart",
        "ios-contacts",
        "md-contact",
        "md-image",
        "ios-images",
        "md-images"
      ]
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
  },
  methods:{

  }
}
</script>
