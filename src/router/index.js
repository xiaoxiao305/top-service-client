import Vue from 'vue'
import Router from 'vue-router'
import Socket from "../logic/websocket"
import proto from "../logic/proto"
import code from "../logic/code"
import user from "../logic/user"
Vue.use(Router)
const origin = Router.prototype.push
Router.prototype.push = function(location) {
  return origin.call(this, location).catch(err => err)
}
let routes=[
  {
    path: '/login',
    name: 'UserLogin',
    component: () => import("@/pages/login")
  },
  {
    path: '/form',
    name: 'FormDesign',
    component: () => import("@/components/form-design")
  },
  {
    path: '/',
    name: 'Home',
    component: ()=>import("@/pages/home")
  },
  {
    path: '/m',
    name: 'Main',
    component: ()=>import("@/pages/main"),
  },
  {
    name:"404",
    path: '/404',
    component: ()=>import("@/pages/404"),
  },
  {
    path:"/flowchart",
    name:"Flowchart",
    component: ()=>import("@/pages/flowchart"),
  }
]
let router=new Router({mode:"history",routes:  routes})

router.beforeEach((to, from, next) => {
  // return next()
  let path=to.path.toLowerCase().split("?")[0]
  if (path==="/login" || path=="/404") {
    return next()
  }
  let app=router.app
  if(app.$ws && app.$ws.authorized){
    if (!user.account||user.account===""){
      next("/login")
      return
    }
    //todo::权限检查
    next()
  }else {
    if (user.token==="") {
      next("/login")
      return
    }
    let ws = new Socket()
    ws.addFunc(proto.LoginRsp, (res) => {
      if (res.code!==code.OK){
        next("/login")
        return
      }
      ws.authorized=true
      user.setInfo(res.info)
      app.addSocket(ws)
      next()
    })
    ws.connect().then(res => {
      ws.call(proto.Login,user.account,user.token,device.code(),window.domain(),true)
    }, (e) => {
      next("/login")
    })
  }
})
export default router
