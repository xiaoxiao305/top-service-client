<template>
  <div class="login">
    <ul @keyup.enter="submit">
      <li><img src="static/logo.png">企业信息&流程管理平台</li>
      <li><icon type="ios-person" size="26" /><input type="text" v-model="account" :placeholder="$t('loginTips')"></li>
      <li><icon type="ios-lock" size="26" /><input type="password" v-model="password" placeholder="请输入密码"></li>
      <li msg v-if="loading">
        <div v-if="msg==''"><i v-for="i in 5"></i></div>
        {{msg}}
      </li>
      <li><a @click="showSignup=true">注册</a> <input type="button" :value="$t('login')" @click="submit" :disabled="disabled"/></li>
    </ul>
    <signup v-if="showSignup"></signup>
  </div>
</template>
<script>
import md5 from "js-md5"
import Socket from "../logic/websocket"
import proto from "../logic/proto"
import code from "../logic/code"
import user from "../logic/user"
import Waves from "../logic/waves"
import ajax from "../logic/ajax"
import signup from "../components/signup"
export default {
  name: "Login",
  components: {signup},
  data(){
    return{
      showSignup:false,
      account:"123526655235",
      password:"123",
      ws:null,
      loading:false,
      msg:"",
      disabled:false,
      waves:null
    }
  },
  methods:{
    error(msg){
      this.loading=true
      this.msg=msg
      setTimeout(()=>{
        this.msg=""
        this.loading=false
        this.disabled=false
      },5000)
    },
    LoginRsp(res){
      if (res.code===code.OK) {
        this.ws.authorized=true
        this.addSocket(this.ws)
        user.setInfo(res.info)
        this.$router.push("/m")
      }else{
        this.error(code.Message(res.code))
      }
    },
    submit(){
      this.disabled=true
      this.loading=true
      this.ws=new Socket()
      this.ws.addFunc(proto.LoginRsp,this.LoginRsp,this)
      this.ws.connect().then(res=>{
        this.loading=false
        this.ws.call(proto.Login,this.account,md5(this.password),device.code(),window.domain(),false)
      },(e=>{this.error("错误的账号或密码")}))
    }
  },
  created() {
    session.clear()
    ajax.Get("/domain").then(res=>{
      //if (res.code!==code.OK){this.$router.push("/404")}
    })
  },
  mounted() {
    this.waves=new Waves(document.querySelector(".login"),{waves:1, width:600,fps:25});
    this.waves.animate();
  },
  destroyed(){
    this.waves.stop()
    this.waves=null
  }
}
</script>

<style scoped>
.login {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  display: block;
}

.login > ul {
  background: rgba(10, 27, 54, 0.5);
  border-radius: 4px;
  width: 600px;
  position: fixed;
  top: calc(50% - 150px);
  left: calc(50% - 300px);
}
ul>li:first-child>img{width:40px;height:40px;margin-top: 10px;margin-left: 23px;vertical-align: top;margin-right: 10px}
ul>li:first-child{font-size: 16px;font-weight: bold}
.login li {
  line-height: 60px;
  border-bottom: 1px solid rgba(150, 150, 150, 0.1);
  height: 60px;
  color: #ffffff;
}

.login li>i {
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 20px;
  margin-left: 30px;
  margin-right: 30px;
  color: #ffffff;
}

.login li input[type="text"], input[type="password"] {
  height: 58px;
  line-height: 58px;
  background: transparent;
  outline: none;
  border: 0;
  border-left: 1px solid rgba(0, 85, 132, 0.6);
  color: #FFFFFF;
  margin: 0px;
  font-size: 20px;
  font-weight: bold;
  width: calc(100% - 90px);
  padding-left: 10px;
}

.login li input[type="text"]:hover, input[type="password"]:hover {
  height: 58px;
  line-height: 58px;
  background: transparent;
  border: 0;
  box-shadow: 0px 0px 10px 0px rgb(0, 155, 244) inset;
  border-radius: 3px;
  padding-left: 10px;
  -moz-transition: border ease-in-out 0.5s, box-shadow ease-in-out 0.5s;
  -webkit-transition: border ease-in-out 0.5s, box-shadow ease-in-out 0.5s;
  transition: border ease-in-out 0.5s, box-shadow ease-in-out 0.5s;
}

.login li:last-child {
  border-bottom: 0;
  text-align: center;
}

.login li input[type=button] {
  background: rgba(0, 155, 244, 0.6);
  width: 50%;
  height: 40px;
  margin-top: 10px;
  text-align: center;
  font-size: 16px;
  border: 0px;
  border-radius: 3px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  padding: 0;
  line-height: 40px;
}

.login li input[type=button]:hover {
  box-shadow: 0px 0px 5px 0px rgb(0, 155, 244);
  border-radius: 3px;
  -moz-transition: border ease-in-out 0.5s, box-shadow ease-in-out 0.5s;
  -webkit-transition: border ease-in-out 0.5s, box-shadow ease-in-out 0.5s;
  transition: border ease-in-out 0.5s, box-shadow ease-in-out 0.5s;
}

.login input[type="text"]::-webkit-input-placeholder{color:rgba(255,255,255,0.5);}
.login input[type="text"]:-moz-placeholder{color:rgba(255,255,255,0.5);}
.login input[type="text"]::-moz-placeholder{color:rgba(255,255,255,0.5);}
.login input[type="text"]:-ms-input-placeholder{color:rgba(255,255,255,0.5);}
.login input[type="password"]::-webkit-input-placeholder{color:rgba(255,255,255,0.5);}
.login input[type="password"]:-moz-placeholder{color:rgba(255,255,255,0.5);}
.login input[type="password"]::-moz-placeholder{color:rgba(255,255,255,0.5);}
.login input[type="password"]:-ms-input-placeholder{color:rgba(255,255,255,0.5);}

.login li[msg]{
  color: #ee4000 !important;
  font-size: 14px;
  text-align: center;
}

.login li[msg] > div {
  text-align: center;
  margin: 0 auto;
  width: 200px;
  height: 58px;
}

.login li[msg] > div > i {
  display: inline-block;
  height: 10px;
  width: 10px;
  border-radius: 100%;
  background: #E6F3FB;
  margin-right: 8px;
  margin-left: 0;
  -webkit-animation: dotted 1.5s ease infinite;
  animation: dotted 1.5s ease infinite;
}

.login li[msg]>div>i:nth-child(1){-webkit-animation-delay:0.2s; animation-delay: 0.2s}
.login li[msg]>div>i:nth-child(2){-webkit-animation-delay:0.4s;animation-delay: 0.4s}
.login li[msg]>div>i:nth-child(3){-webkit-animation-delay:0.6s;animation-delay: 0.6s}
.login li[msg]>div>i:nth-child(4){-webkit-animation-delay:0.8s;animation-delay: 0.8s}
.login li[msg]>div>i:nth-child(5){-webkit-animation-delay:1s;animation-delay: 1.5s}
@-webkit-keyframes dotted{ 0%{opacity: 1;transform:scale(1)} 100%{opacity: 0;transform:scale(.5);}}
@keyframes dotted{ 0%{opacity: 1;transform:scale(1)} 100%{opacity: 0;transform:scale(.5);}}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
  -webkit-transition-delay: 99999s;
  -webkit-transition: color 99999s ease-out, background-color 99999s ease-out;
}
</style>
