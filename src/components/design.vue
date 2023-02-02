<template>
  <!-- 模板功能 页面设计 -->
    <div class="design">
      <div><widget-btn :items="items" :data="item" @dragWidget="dragCurWidget"></widget-btn></div>
      <div>
        <div class="oprs">
          <div @click="clearComponent"><Icon type="ios-trash" />清空</div>
          <div @click="saveDesign"><Icon type="md-checkmark-circle" />保存</div>
        </div>
        <widget-form :items="items" :item="item" @dragWidget="dragCurWidget"></widget-form>
        <!-- <div class="mapping" v-if="draging">组件名称及UI</div> -->
      </div>
      <div class="property" v-if="item && item.id>0">
        <widget-config  :data="item"></widget-config>
      </div>
    </div>
  </template>
  <script>
  import widgetBtn from '../components/widget-btn';
  import widgetConfig from '../components/widget-config';
  import widgetForm from '../components/widget-form';
  import proto from "../logic/proto";
  import code from "../logic/code";
  import widget from "../logic/widget";
  export default {
    components: { widgetBtn,widgetConfig,widgetForm },
    name: "ui-designer",
    props:['menu','setTab'],
    data(){
      return{
        items:[],
        draging:false,
  
        item:{},//当前选中控件
        maxWidgetIndex:"",//拖拽后最大控件索引
        templateId:0
      }
    }, 
    methods:{
      //用于接收子组件需要修改父组件值时的方法
      dragCurWidget(widget){
        this.item=widget;
        this.maxWidgetIndex=widget.filed;
      },
      saveDesign(){
        let dbTemplates=widget.getdbTemplates(this.items);
        if(this.menu.type==3)//流程页面设计
        {
              //page id
              dbTemplates.id=parseInt(Math.random()*100)
              let pages=store['flowPage']?JSON.parse(store['flowPage']):{};
              let page=pages&&pages[this.menu.id]?pages[this.menu.id]:{}
              if(page.id>0){
                page.tid=dbTemplates.id;
                pages[this.menu.id]=page;
              }
              store['flowPage']=JSON.stringify(pages);
              //page tid
              store['pageFiled']=JSON.stringify({[page.tid]:dbTemplates});
              this.$Message.info("保存成功");
              return
        }
        this.$ws.addFunc(proto.EditTemplateInfoRsp, function (rsp) {
           if (rsp.code === code.OK) {
            if(this.templateId>0){//update
              this.$Message.info("保存成功");
            }else{//insert 
              if(this.menu.type==12)//员工扩展信息
              {
                this.$Message.info("保存成功");
                store["userTemp"]=JSON.stringify({id:rsp.tid,v:dbTemplates})
                console.log("store[usertemp]:",store["userTemp"])
              }
              else{
                this.$ws.addFunc(proto.BindTemplateRsp, function (rsp) {
                if (rsp === code.OK) {
                  this.$Message.info("保存成功");
                } else {
                  this.$Message.error(code.Message(rsp))
                } 
              }, this)
                this.$ws.call(proto.BindTemplate,rsp.tid,this.menu.id);
            }
          }
            
           } else {
             this.$Message.error(code.Message(rsp.code))
           }
         }, this)
         console.log("design this.templateId:",this.templateId)
         this.$ws.call(proto.EditTemplateInfo,this.templateId?this.templateId:0,JSON.stringify(dbTemplates),this.maxWidgetIndex); 
      },
      clearComponent(){
        this.items=[];
        this.item={};
      },
      async loadTemplates(){
        if(this.menu.tid<1 && this.menu.type!=12)return;//type==12员工扩展信息
        let dbTemplates=await widget.loadTemplateInfo(this.templateId);
        if(!dbTemplates || !dbTemplates.data || dbTemplates.data.length<1)return;
        let is=widget.getUITemplates(dbTemplates.data,false);
        this.items=is;
      }
    },
    created(){
      this.templateId=this.menu.tid;
      if(this.menu.type==12)//type==12员工扩展信息
        this.templateId=(store["userTemp"]&&JSON.parse(store["userTemp"]).id)?JSON.parse(store["userTemp"]).id:0;
      console.log("design  created this.menu:",this.menu,"this.templateId:",this.templateId)
      this.loadTemplates();
    }
  }
  </script>
  
  <style scoped>
  .design{display: flex;flex-direction:row;height: 100%;background: #fff}
  .design>div:first-child{width:200px;padding-left: 8px;}
  .design>div:nth-child(2){border-left:1px solid #ccc;flex: 1;border-right: 1px solid #ccc;padding-left: 8px;padding-right: 8px;}
  .design>div:last-child{width: 250px;}
  .design>div:first-child>b{display: block;border: 1px dotted #ccc; width: 80px;margin: 5px;padding:5px;cursor: move;}
  .mapping{width: 100%;height:40px;border:1px solid #ccc;margin-top: 8px;}
  .property{display: flex;flex-direction:column}
  .property>b{height:40px;line-height: 40px;text-align: center;background: #fff;border-bottom: 1px solid #ccc}
  .property>div{display: flex;flex-direction: row;height:30px;line-height:30px;margin-top: 5px;padding-right: 8px}
  .property>div>label{width:80px;padding-left: 8px;}
  .property>div>input{flex: 1}
  .property>div>select{flex: 1}
  .oprs div{display:inline;height:40px;font-size:16px;color:dodgerblue;cursor:pointer;padding: 8px;}
  </style>
  