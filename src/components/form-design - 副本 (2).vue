<template>
  <div class="design">
    <div class="widget">
      <b>组件</b>
      <div v-for="(widget,i) in widgets" :key="i" draggable="true" @dragstart="dragStart($event,widget)" @dragend="dragging=false"><icon :type="widget.icon"></icon>{{widget.name}}</div>
    </div>
    <div class="form">
      <div><Button type="success" siz="small" @click="layout.preview=true">预览</Button><Button type="primary" siz="small" @click="saveForm">保存</Button></div>
      <table @dblclick="layout.show=true"  @mouseup="merge.check($event)">
        <tr v-for="(columns,r) in layout.grid" :key="r">
          <td v-for="(col,c) in columns" v-if="col!==-1"
              :colspan="col%100>1?col%100:null"
              :rowspan="col>199?Math.floor(col/100):null"
              :key="r+'-'+c"
              :class="{'active':merge.in(r,c)}"
              @mouseenter="merge.ready?merge.join(r,c):null"
              @mousedown="merge.start(r,c)"
              @drop="dropWidget($event,r,c)"
              @dragenter="dragEnter($event,r,c)"
              @dragleave="dragLeave"
              @dragover.prevent style="min-width:80px">
            <div v-for="(widget,i) in getWidgets(r,c)" :key="i" @click.stop="current=widget" :class="{'current':current.id===widget.id}">
              <b>{{widget.name}}</b>
              <widget :model="widget"></widget>
              <Icon type="ios-close" v-if="current.id===widget.id" @click.stop="onDelete(widget.id)"/>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div class="setting" v-if="current">
      <b>属性设置</b>{{ current }}
      <ul>
        <li><b>名称:</b><Input v-model="current.name"></Input></li>
        <li v-if="current.type===1||current.type===2"><b>占位提示符:</b><Input v-model="current.placeholder"></Input></li>
        <li v-if="current.type===1||current.type===2||current.type===8||current.type===9"><b>默认值:</b><Input v-model="current.defaultValue"></Input></li>
        <li v-if="current.type===3 || current.type===4 || current.type===5">
          <b>数据源:</b>
          <div>
            <div v-for="(opt,i) in current.options" :key="i" class="data-source">
              <!-- <Input v-model="opt.value"></Input> -->
              <Input v-model="opt.label"></Input>
              <Icon type="ios-remove-circle" @click="removeOptions(i)" />
            </div>
            <b @click="addOption" style="color:dodgerblue;cursor: pointer;">添加选项</b>
          </div>
        </li>
        <li v-if="current.type===6||current.type===7"><b>范围:</b><i-Switch></i-Switch></li>
      </ul>
    </div>
    <Modal v-model="layout.show" title="设置布局" @on-ok="setLayout">
      <p>行数:<Input v-model="layout.rows" type="number"></Input></p>
      <p>列数:<Input v-model="layout.columns" type="number"></Input></p>
    </Modal>
    <div class="merge-menu" :style="{'top':merge.menu.y+'px','left':merge.menu.x+'px'}" v-if="merge.show" @click="mergeCell">合并选择中单元格</div>
    <Modal v-model="layout.preview" title="预览" width="800">
      <table class="preview">
        <tr v-for="(columns,r) in layout.grid" :key="r">
          <td v-for="(col,c) in columns" v-if="col!==-1" :colspan="col%100>1?col%100:null" :rowspan="col>199?Math.floor(col/100):null" :key="r+'-'+c">
            <div v-for="(widget,i) in getWidgets(r,c)" :key="i" >
              <b>{{widget.name}}</b><widget :model="widget"></widget>
            </div>
          </td>
        </tr>
      </table>
    </Modal>
  </div>
</template>

<script>
import RichEditor from "./rich-editor.vue";
import Merge from "../logic/cell-merge";
import proto from "../logic/proto";
import code from "../logic/code";
import widget from "../logic/widget";
let Widget = {
  components:{RichEditor,widget},
  props:['model'],
  render(createElement) {
    let ui={1:"Input",2:"Input",3:"RadioGroup",4:"CheckboxGroup",5:"Select",6:"TimePicker",7:"DatePicker",8:"Rate",9:"i-Switch",10:"Upload",11:"Upload",12:"rich-editor",999:"p"}
    let children =[]
    if (this.model.label){
      if (!this.model.options){
        this.$set(this.model, 'options',[{value:1,label:this.model.label+1},{value:2,label:this.model.label+2},{value:3,label:this.model.label+3}])
      }
      this.model.options.forEach(opt=>{children.push(createElement(this.model.label, {attrs: {value: opt.value}},opt.label))})
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
    }
    return createElement(ui[this.model.type],data,children)
  }
}

export default {
  name: "FormDesign",
  components:{"Widget":Widget,RichEditor},
  props:['menu'],
  data(){
    return {
      widgets:[
        {type:1,name:"文本框",icon:"ios-create-outline"},
        {type:2,name:"多行输入",icon:"ios-create-outline"},
        {type:3,name:"单选框组",icon:"md-radio-button-on",label:"Radio"},
        {type:4,name:"多选框组",icon:"md-checkbox",label:"Checkbox"},
        {type:5,name:"下拉选择框",icon:"md-arrow-dropdown",label:"Option"},
        {type:6,name:"时间选择器",icon:"ios-time",range:false},
        {type:7,name:"日期选择器",icon:"ios-calendar",range:false},
        {type:8,name:"评分",icon:"ios-star-outline"},
        {type:9,name:"开关",icon:"ios-switch"},
        {type:10,name:"图片",icon:"ios-image"},
        {type:11,name:"文件",icon:"md-cloud-upload"},
        {type:12,name:"富文本编辑",icon:"md-document"},
      ],
      current: {id:""},
      layout:{
        rows:0,columns:0,show:false,
        grid:[],
        preview:false
      },
      forms:[],//【{type,name,position}】
      atomicId:"A",
      merge:new Merge(),
      tId:0
    }
  },
  methods:{
    removeOptions(index){
      this.current.options.splice(index, 1)
    },
    addOption() {
        this.current.options.push({
          value: this.newOption
        }) 
    },
    mergeCell(){
      this.merge.merge(cells=>{
        let start=cells[0]
        cells.splice(0,1)
        for (let i=0;i<this.forms.length;i++){
          if(cells.contains(this.forms[i].pos)){
            this.forms[i].pos=start
          }
        }
      })
    },
    setLayout(){
      let rows=parseInt(this.layout.rows),
        columns=parseInt(this.layout.columns);
      if (rows<this.layout.grid.length){
        return
      }
      let max=0
      for (let i=0;i<this.layout.grid.length;i++){
          if (max<this.layout.grid[i].length){
            max=this.layout.grid[i].length
          }
      }
      if (columns<max){
        return
      }
      let org=this.layout.grid.length
      for (let i=0;i<rows;i++){
        if (org>i){
          for (let c=0;c<columns-max;c++){
            this.layout.grid[i].push(0)
          }
        }else{
          this.layout.grid.push(new Array(columns).fill(0))
        }
      }
    },
    getWidgets(row,col){
      let widgets=[]
      for (let i=0;i<this.forms.length;i++){
        let widget=this.forms[i]
        if (widget.pos[0]==row && widget.pos[1]==col){
          widgets.push(widget)
        }
      }
      return widgets
    },
    saveForm(){
        let dbTemplates=widget.getdbTemplates(this.forms);
        console.log("form-design this.forms:",this.forms,"dbTemplates:",dbTemplates)
      //todo::
      let layout=JSON.stringify(this.layout.grid)
      // this.call(proto.EditTemplateInfo,(this.menu&&this.menu.tid>0?this.menu.tid:0),JSON.stringify(this.forms),this.atomicId,layout);
      this.$ws.addFunc(proto.EditTemplateInfoRsp, function (rsp) {
           if (rsp.code === code.OK) {
            if(this.tId>0){//update
              this.$Message.info("保存成功");
            }else{//insert 
              // if(this.menu.type==12)//员工扩展信息
              // {
              //   this.$Message.info("保存成功");
              //   store["userTemp"]=JSON.stringify({id:rsp.tid,v:dbTemplates})
              //   console.log("store[usertemp]:",store["userTemp"])
              // }
              // else{
                this.$ws.addFunc(proto.BindTemplateRsp, function (rsp) {
                if (rsp === code.OK) {
                  this.$Message.info("保存成功");
                } else {
                  this.$Message.error(code.Message(rsp))
                } 
              }, this)
              this.$ws.call(proto.BindTemplate,rsp.tid,this.menu.id);
            // }
          }
            
           } else {
             this.$Message.error(code.Message(rsp.code))
           }
         }, this)
      console.log("design this.tId:",this.tId)
      this.$ws.call(proto.EditTemplateInfo,this.tId?this.tId:0,JSON.stringify(dbTemplates),this.atomicId); 
    },
    async loadTemplates(){
      if(this.tId<1)return
      this.$ws.call(proto.TemplateInfo,this.tId); 
      this.$ws.addFunc(proto.TemplateInfoRsp, function (rsp) {
          let dbInfo=widget.loadTemplateInfo2(rsp)
          if(!dbInfo || !dbInfo.data || dbInfo.data.length<1)return;
          let is=widget.getUITemplates(dbInfo.data,false);
          this.items=is;
      }, this)
    },
    dragStart(e,widget){
      e.dataTransfer.setData('widget', JSON.stringify(widget))
      this.dragging=true
    },
    dropWidget(e,row,col){
      e.preventDefault()
      e.stopPropagation()
      let widget=JSON.parse(e.dataTransfer.getData("widget"))
      this.atomicId=(this.atomicId.toDecimal()+1).toNumber52()
      widget.id=this.atomicId
      widget.pos=[row,col]
      this.forms.push(widget)
      this.current=widget
      this.dragLeave()
    },
    dragEnter(e,r,c){
      e.preventDefault()
      this.forms.push({type: 999,pos:[r,c]})
    },

    dragLeave(){
      for (let i =0;i<this.forms.length;i++){
        if(this.forms[i].type===999){
          this.forms.splice(i,1)
        }
      }
    },
    onDelete(id){
      for (let i=0;i<this.forms.length;i++){
        if (this.forms[i].id===id){
          this.forms.splice(i,1)
          this.current={}
          break
        }
      }
    }
  },
  mounted() {
    this.layout.grid=[[0]]
    this.layout.rows=this.layout.grid.length
    for (let i=0;i<this.layout.rows;i++){
      if(this.layout.grid[i].length>this.layout.columns){
        this.layout.columns=this.layout.grid[i].length
      }
    }
    this.merge.grid=this.layout.grid
  },created(){
    this.tId=this.menu.tid;
    this.loadTemplates();
  }
}
</script>

<style scoped>
.design{display: flex;flex-direction:row;height: 100%;background: #fff}
.design>div>b:first-child{text-align: center;display: block;width:100%;background:#f1f1f1;height: 40px; border-bottom: 1px solid #ccc;line-height:40px}
.design .widget{width:240px;}
.design .widget>div{height: 30px;line-height: 30px;border: 1px solid #ccc;margin-top:10px;width:100px;padding-left:8px;display: inline-block;margin-right: 8px;margin-left:10px}
.design .widget>div .ivu-icon{font-size: 17px;margin-right:5px}

.design .form{flex: 1;border-left: 1px solid #ccc;border-right: 1px solid #ccc;}
.design .form>div:first-child{height: 40px; text-align: right;padding-right: 10px;line-height: 35px;border-bottom: 1px solid #ccc;}
.design .form>div:last-child{height: 100%;width: 100%;padding-top: 10px;}

.design .setting{width: 300px}
li{display: flex;line-height:40px}
li>b{text-align: left;border: 0;display: inline-block;width:100px;background:none;height: 40px;line-height:40px}
.active{border:1px solid #2b85e4 !important;}
.design .form>div:last-child>div>p{height:3px;background: #2c77eb;width:100%}
.data-source{display: flex;}
.data-source .ivu-input{width:60px !important;}
.data-source .ivu-icon{font-size: 18px;margin-right:5px;line-height: 32px; color: #ff9900;margin-left: 5px;}

.ivu-icon{pointer-events: auto !important;}
.design .form>table{width: 100%;border-collapse: collapse;display:table;height: 100%;}
.design .form>table td{border: 1px dotted #ccc;line-height: 40px;height: 40px;}
.design .form>table>tr>td>div>p{height:3px;background: #2c77eb;width:100%}
.design .form>table>tr>td>div{ border: 1px dotted #f1f1f1;}
.design .form>table>tr>td>div .ivu-icon{color:#ed4014;float: right;font-size:20px;}
.design .form .current{border:1px solid #ed4014;border-radius: 3px;}
.merge-menu{position:fixed;width:120px;height: 30px;line-height: 30px;background: #f1f1f1;border: 1px solid #ccc;top:0;left:0; text-align: center;cursor: pointer}

.preview{width:100%;border-collapse: collapse;}
td{vertical-align: top}
td>div{margin-bottom: 10px;}
td>div>b{padding-left:5px;padding-right: 5px;position: relative;line-height: normal;vertical-align: middle;display: inline-block;min-width:60px;text-align: right}
td>div .ivu-input-wrapper,
td>div .ivu-select,
td>div .ivu-upload{width: 250px}
td>div .ivu-checkbox-group,td>div .ivu-upload{display: inline-block;position: relative;line-height: normal;vertical-align: middle;}
td>div .editor{display: inline-block;position: relative;line-height: normal;vertical-align: middle;}
</style>
