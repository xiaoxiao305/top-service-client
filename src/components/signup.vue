<template>
  <div class="signup">
    <div>
      <img src="static/logo.png">
      <b>企业信息&流程管理平台</b>
      <div>在中华人民共和国境内提供非经营性互联网信息服务的网站都应依法进行备案，未取得许可或者未履行备案手续的，不得从事互联网信息服务</div>
    </div>
    <ul>
      <li></li>
      <li>Let’s build from here</li>
      <li><b>手机</b></li>
      <li><input type="text" v-model="phone"></input> <a>发送验证码</a></li>
      <li><b>密码</b></li>
      <li><input type="text" v-model="pass"></input></li>
      <li><b>姓名</b></li>
      <Li><input type="text" v-model="name"></input></Li>
      <li><b>公司名称</b></li>
      <li><input type="text" v-model="com"></input></li>
      <li><b>域名前缀</b></li>
      <li><input type="text" v-model="domain"></input></li>
      <li><b>验证码</b></li>
      <li><input type="text" v-model="code"></input></li>
      <li><Button type="primary" @click="submit">{{$t('signup')}}</Button></li>
      <li></li>
    </ul>
  </div>
</template>

<script>
import ajax from "../logic/ajax";
import code from "../logic/code";
import md5 from "js-md5";
export default {
  name: "Signup",
  data() {
    return {
      name: "",
      pass: "",
      domain: "",
      com: "",
      code: "",
      phone: ""
    }
  },
  methods: {
    submit() {
      //todo  check input

      let data = {name: this.name, pass: md5(this.pass), domain: this.domain, com: this.com, phone: this.phone}
      data = JSON.stringify(data)
      let url = "/signup?data=" + data + "&captcha=" + this.code
      ajax.Get(url).then(res => {
        if (res.code === code.OK) {
          window.location.href = "http://" + res.domain + ".itsmtop.com/login"
        }
      })
    }
  }
}
</script>

<style scoped>
  .signup{display:flex;flex-direction: row;width: 1024px; position: fixed;top: calc(50% - 320px);left: calc(50% - 512px);}
  .signup>div{background:#fff;width: 400px;border-right: 1px solid #e5e8ee;}
  .signup>div>img{width: 200px;height: 200px;margin-left: 100px;margin-top:50px;}
  .signup>div>b{display:block;margin-top: 30px;font-size: 16px;color: #2c77eb;width:100%;text-align: center}
  .signup>div>div{padding:40px;color:#ccc;margin-top: 200px}
  .signup>ul{background:#f5f7fd;display:flex;flex-direction: column;width: 600px;}
  .signup>ul>li{padding-left:80px;}
  .signup>ul>li:first-child{height: 100px;font-size:30px;color:#404040;font-weight: bold}
  .signup>ul>li:nth-child(2){font-size:30px;color:#666;font-weight: bold}
  .signup>ul>li:last-child{height: 100px;}
  .signup>ul>li>b{height: 30px;line-height: 30px;color:#bbb;}
  input[type=text]{width: 300px;height: 40px;line-height: 40px;border: 1px solid #ccc;}
  button{width: 300px;margin-top: 10px;height:40px;font-size: 16px;font-weight: bold}
</style>
