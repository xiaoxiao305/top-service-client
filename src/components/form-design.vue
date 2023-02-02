<template>
  <div class="design">
    <div class="widget">
      <b>组件</b>
      <div v-for="(widget,i) in widgets" :key="i" draggable="true" @dragstart="dragStart($event,widget)" @dragend="dragging=false"><icon :type="widget.icon"></icon>{{widget.name}}</div>
      <b>布局</b>
    </div>
    <div class="form">
      <div><Button type="success" siz="small">预览</Button> <Button type="primary" siz="small" @click="saveForm">保存</Button></div>
      <div @drop="dropWidget($event)" @dragenter="dragEnter($event)" @dragover="dragMove($event)" @dragleave="removeTips($event)" @dragover.prevent id="0xc0001023c0">
        <div @click="select(widget)" v-for="(widget,i) in forms" :key="i" :class="{'active':(current.id===widget.id),'disable-evt': dragging}" @dragstart="moveStart(i)" draggable="true" >
         <b v-if="widget.type!==999">{{widget.name}}</b><widget :model="widget"></widget><Icon type="ios-trash" v-if="current.id===widget.id" @click="onDelete(i)"/>
        </div>
      </div>
    </div>
    <div class="setting" v-if="current">
      <b>属性设置</b>
      <ul>
        <li><b>名称:</b><Input v-model="current.name"></Input></li>
        <li v-if="current.type===1"><b>数据类型:</b><Select>
          <Option value="1">文本</Option>
          <Option value="2">数字</Option>
        </Select></li>
        <li v-if="current.type===1"><b>多行:</b><i-Switch></i-Switch></li>
        <li v-if="current.type===1"><b>占位提示符:</b><Input></Input></li>
        <li v-if="current.type===1"><b>默认值:</b><Input></Input></li>
        <li v-if="current.type===3 || current.type===4 || current.type===5">
          <b>数据源:</b>
          <div>
            <div v-for="(opt,i) in current.source" :key="i" class="data-source"><Input v-model="opt.value"></Input><Input v-model="opt.label"></Input><Icon type="ios-remove-circle" /></div>
          </div>
        </li>
        <li v-if="current.type===6||current.type===7"><b>范围:</b><i-Switch></i-Switch></li>
      </ul>
    </div>
  </div>
</template>

<script>
import RichEditor from "./rich-editor.vue";
let Widget = {
  components:{RichEditor},
  props:['model'],
  render(createElement) {
    let ui={1:"Input",2:"Input",3:"RadioGroup",4:"CheckboxGroup",5:"Select",6:"TimePicker",7:"DatePicker",8:"Rate",9:"i-Switch",10:"Upload",11:"Upload",12:"rich-editor",999:"p"}
    let children =[]
    if (this.model.options){
      if (!this.model.source){
        this.$set(this.model, 'source',[{value:1,label:this.model.options+1},{value:2,label:this.model.options+2},{value:3,label:this.model.options+3}])
      }
      this.model.source.forEach(opt=>{children.push(createElement(this.model.options, {attrs: {value: opt.value}},opt.label))})
    }
    //todo createElement(tag:any,data:any,children:any,normalizationType: any,alwaysNormalize: boolean)
    let data={domProps:{value: this.model.name},attrs:{}}
    switch (this.model.type){
      case 2:
        data.attrs={type:"textarea"}
        break
      case 10:{
        data.attrs={action:"http://127.0.0.1",accept:"image/*"}
        children=[createElement("Icon",{attrs:{type:"ios-image",size:60}})]
       // data.on={"before-upload":function (){return false}}
        break
      }
      case 11:
        data.attrs={action:"http://127.0.0.1",type:"drag"}
        children.push(createElement("div",{style:{paddingLeft:"10px",paddingRight:"10px"}},[createElement("Icon",{attrs:{type:"md-cloud-upload",size:48},style:{color: "#3399ff"}}),createElement("span","点击或将文件拖拽到这里上传")]))
        break
      case 12:
        data.attrs={value:""}
        break
    }
    return createElement(ui[this.model.type],data,children)
  }
}

export default {
  name: "FormDesign",
  components:{"Widget":Widget,RichEditor},
  data(){
    return {
      widgets:[
        {type:1,name:"文本框",icon:"ios-create-outline"},
        {type:2,name:"多行输入",icon:"ios-create-outline"},
        {type:3,name:"单选框组",icon:"md-radio-button-on",options:"Radio"},
        {type:4,name:"多选框组",icon:"md-checkbox",options:"Checkbox"},
        {type:5,name:"下拉选择框",icon:"md-arrow-dropdown",options:"Option"},
        {type:6,name:"时间选择器",icon:"ios-time",range:false},
        {type:7,name:"日期选择器",icon:"ios-calendar",range:false},
        {type:8,name:"评分",icon:"ios-star-outline"},
        {type:9,name:"开关",icon:"ios-switch"},
        {type:10,name:"图片",icon:"ios-image"},
        {type:11,name:"文件",icon:"md-cloud-upload"},
        {type:12,name:"富文本编辑",icon:"md-document",text:""},
      ],
      current: {id:""},
      forms:[],
      atomicId:"A",
      widget:{index:-1,action:"",target:null}, //moving or dragging
      dragging:false
    }
  },
  methods:{
    onCreated(editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },
    //对已设置的组件进行位置移动
    moveStart(index){
      this.widget.index=index
      this.widget.action="moving"
      this.current=this.forms[index]
    },
    saveForm(){
      console.log(this.forms)
    },
    select(widget){this.current=widget},
    dragStart(e,widget){
      e.dataTransfer.setData('widget', JSON.stringify(widget))
      this.dragging=true
    },
    moveTips(index){
      if (index===this.widget.index){
        return
      }
      let origin=this.widget.index
      this.widget.index=index
      this.forms.splice(index,0,this.forms.splice(origin,1)[0])
    },
    removeTips(e){
      let target=""
      if (e.target.id &&e.target.id!==null){target=e.target.id}
      if (e.target===1 || target===this.widget.target){
        this.forms.splice(this.widget.index, 1)
        this.widget.index = -1
        this.widget.target=null
        this.dragging=false
      }
    },
    dropWidget(e){
      e.preventDefault()
      e.stopPropagation()
      this.dragging=false
      if (this.widget.action==="moving"){
        this.widget={index:-1,action:""}
        return
      }
      let index=this.widget.index
      this.removeTips({target:1})
      let widget=JSON.parse(e.dataTransfer.getData("widget"))
      this.atomicId=(this.atomicId.toDecimal()+1).toNumber52()
      widget.id=this.atomicId
      this.forms.insert(index,widget)
      this.current=widget
    },
    dragEnter(e){
      e.preventDefault()
      if (this.widget.action==="moving"){return}
      if (e.target.id!=="0xc0001023c0"){return}
      console.log(this.widget,e.target.id)
      if (this.widget.index===-1){
        this.dragging=true
        this.forms.push({type: 999})
        this.widget.index=this.forms.length-1
        this.widget.target=e.target.id
      }
      this.moveTips(this.moveIndex(e.clientY))
    },
    moveIndex(pointY) {
      let index = Math.floor(pointY / 40)
      if (this.forms.length <=index) {
        index = this.forms.length - 1
      }
      return index
    },
    dragMove(e){
      e.preventDefault()
        let index=this.moveIndex(e.clientY)
        if(this.widget.action==="moving"){
          if (index===this.widget.index){return}
          //正在移动已放置的组件
          this.forms.move(index,this.widget.index)
          this.widget.index=index
        }else{
          if (e.target.id==="0xc0001023c0")this.moveTips(index)
        }
    },
    onDelete(index){
      this.forms.splice(index,1)
      if (index===this.forms.length){
        this.current=this.forms[index-1]
      }
    }
  }
}
</script>

<style scoped>
.design{display: flex;flex-direction:row;height: 100%;background: #fff}
.design .widget{width:240px;}
b{text-align: center;display: block;width:100%;background:#f1f1f1;height: 40px; border-bottom: 1px solid #ccc;line-height:40px}
.design .widget>div{height: 30px;line-height: 30px;border: 1px solid #ccc;margin-top:10px;width:100px;padding-left:8px;display: inline-block;margin-right: 8px;margin-left:10px}
.design .widget>div .ivu-icon{font-size: 17px;margin-right:5px}
.design .widget>div:last-child{display: block;margin-top: 20px;width: 100%;border:0;}
.design .form{flex: 1;border-left: 1px solid #ccc;border-right: 1px solid #ccc;}
.design .form>div:first-child{height: 40px; text-align: right;padding-right: 10px;line-height: 35px;border-bottom: 1px solid #ccc;}
.design .form>div:last-child{height: 100%;width: 100%;padding-top: 10px;}
.design .form>div:last-child>div{display: flex;line-height:40px;padding-top:8px}
.design .form>div:last-child>div>b{width: 80px;border: 0;background:none;text-align: left;padding-left:8px;}/*pointer-events: none;*/
/*.design .form>div:last-child>div *{pointer-events: none;}*/
.design .form>div:last-child>div .ivu-icon{font-size:25px;margin-right:5px;height: 40px;line-height:30px;color:#ed4014}
.design .setting{width: 300px}
li{display: flex;line-height:40px}
li>b{text-align: left;border: 0;display: inline-block;width:100px;background:none;height: 40px;line-height:40px}
.active{border:1px solid #2b85e4}
.design .form>div:last-child>div>p{height:3px;background: #2c77eb;width:100%}
.data-source{display: flex;}
.data-source .ivu-input{width:60px !important;}
.data-source .ivu-icon{font-size: 18px;margin-right:5px;line-height: 32px; color: #ff9900;margin-left: 5px;}
.disable-evt{pointer-events: none;}
.ivu-icon{pointer-events: auto !important;}
</style>
