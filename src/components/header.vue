<template>
  <div class="header">
    <img :src="user.logo">
    <b>{{user.com}}</b>
    <Icon type="md-menu" size="24" @click="collapse" :class="[hide?'rotate':'recovery']"/>
    <div>
      <Icon :type="full" @click="fullScreen" size="16"></Icon>
      <Dropdown @on-click="changeLanguage">
        {{$t('lang')}}<icon type="md-arrow-dropdown"  />
        <DropdownMenu slot="list">
          <DropdownItem name="zh">中文简体</DropdownItem>
          <DropdownItem name="tw">中文繁体</DropdownItem>
          <DropdownItem name="en">English</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Dropdown>
        {{ user.name }}<icon type="md-arrow-dropdown"/>
        <DropdownMenu slot="list">
          <DropdownItem><div><icon type="ios-lock"></icon>修改密码</div></DropdownItem>
          <DropdownItem ><div><icon type="ios-trash"></icon> 清除缓存</div></DropdownItem>
          <DropdownItem><div @click="logout"><icon type="md-exit" />退出</div></DropdownItem>
          <DropdownItem divided>
            <div style="background: #2d8cf0;height:10px;width: 20px;display: inline-block" @click="changeTheme('primary')"></div>
            <div style="background: #525a6c;height:10px;width: 20px;display: inline-block;float: right" @click="changeTheme('dark')"></div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</template>

<script>
import user from "../logic/user"
export default {
  name: "Header",
  data() {
    return {
      full: "md-expand",
      hide:false,
      user:user
    }
  },
  methods:{
    collapse(){
      this.hide=!this.hide
      this.$parent.hideMenu=this.hide
    },
    changeLanguage(lang) {
      this.$parent.$i18n.locale = lang
    },
    changeTheme(th){this.$parent.theme=th},
    logout(){
      this.$router.push("/login")
    },
    fullScreen() {
      let target = document.documentElement,full=false;
      let screen = [target.requestFullscreen, target.webkitRequestFullScreen, target.mozRequestFullScreen, target.msRequestFullscreen]
      if (document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen) {
        screen = [document.exitFullscreen, document.webkitCancelFullScreen, document.mozCancelFullScreen, document.msExitFullscreen]
        target = document
        full=true
      }
      screen.every(f => {
        if (f) {
          f.apply(target)
          return false
        }
      })
      this.full = full ? "md-expand" : "md-contract"
    }
  }
}
</script> 
