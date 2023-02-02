<template>
  <div class="z404">
    <div>
      <b><Icon type="ios-alert-outline" size="60" />404 Page Not Found</b>
      <p>对不起，您请求的页面不存在、或已被删除、或暂时不可用</p>
      <p>请点击以下链接继续浏览网页</p>
      <p>》<a style="cursor:pointer" οnclick="history.back()">返回上一页面</a></p>
      <p>》<a href="/">返回网站首页</a></p>
    </div>
  </div>
</template>
<script>
export default {name: "Notfound"}
</script>
<style scoped>
.z404{width:100%; height:100vh;background:#494949; text-align: center}
b{font-size:50px;}
.z404>div{width:800px; color:#eee; font-size:13px;margin:0 auto;padding-top:15%}
.z404>div p{padding: 0;margin: 0; line-height:30px;text-align: center}
.z404>div p:nth-child(2){padding-top:15px;}
.z404>div p a{color:#eee; text-decoration:none;}
.z404>div p a:hover { color:#FC9D1D; text-decoration:underline;}
</style>
