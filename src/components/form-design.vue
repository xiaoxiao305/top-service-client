<template>
  <div class="design">
    <div class="widget">
      <b>组件</b>
      <div v-for="(widget,i) in widgets" :key="i" draggable="true" @dragstart="dragStart($event,widget)" @dragend="dragging=false"><icon :type="widget.icon"></icon>{{widget.name}}</div>
    </div>
    <div class="form" style="min-height: 500px;">
      <div>
        <p class="btn" v-if="type==2"><Input type="text" v-model="pageName" placeholder="请输入表单名称" /></p>
        <p class="btn" @click="layout.preview=true"><Icon type="ios-search" size="24" />预览</p>
        <p class="btn" @click="save()"><Icon type="ios-create-outline" size="24" />保存</p>
      </div> 
      <table @dblclick="layout.show=true"  @mouseup="merge.check($event)">
        <tr v-for="(columns,r) in layout.grid" :key="r">
          <td v-for="(col,c) in columns" v-if="col!==-1"
              :colspan="col%100>1?col%100:null"
              :rowspan="col>199?Math.floor(col/100):null"
              :key="r+'-'+c"
              :class="{'active':merge.in(r,c)}"
              @mouseenter="merge.ready?merge.join(r,c):null"
              @drop="dropWidget($event,r,c)"
              @dragenter="dragEnter($event,r,c)"
              @dragleave="dragLeave"
              @dragover.prevent style="min-width:80px">
            <div v-for="(widget,i) in getWidgets(r,c)" :key="i" @click.stop="current=widget" :class="{'current':current.id===widget.id}">
              <div style="display: flex;padding:12px"><b style="width: 80px;">{{widget.name}}</b>
              <w :model="widget"></w></div>
              <Icon type="ios-close" style="cursor: pointer;padding:5px;" v-if="current.id===widget.id" @click.stop="onDelete(widget.id)"/>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div class="setting" v-if="current">
      <b>属性设置</b>
      <ul>
        <li><b>名称</b><Input v-model="current.name"></Input></li>
        <li v-if="current.type===1||current.type===2"><b>占位符</b><Input v-model="current.placeholder"></Input></li>
        <li class="defVal" v-if="current.type===1||current.type===2||current.type===8||current.type===9"><b>默认值</b>
          <Rate v-if="current.type===8" v-model="current.defaultValue"></Rate>
          <p style="width: 100%;" v-else-if="current.type===9"><iSwitch v-model="current.defaultValue"></iSwitch></p>
          <Input v-else v-model="current.defaultValue"></Input>
        </li>
        <li v-if="current.type===3 || current.type===4 || current.type===5">
          <b>数据源</b>
          <div style="width:100%;flex-direction:column;">
            <div class="ds-type">
              <a :class="(current.isds)?'tag':''"  @click="selectDataSource(1)">基础数据</a>
              <a :class="(current.isds)?'':'tag'" @click="selectDataSource(2)">静态数据</a>
            </div>
            <Dropdown v-if="current.isds" @on-click="checkData">
              <a href="javascript:void(0)">
                  {{ current.curds.name }}
                  <Icon type="ios-arrow-down"></Icon>
              </a>
              <Dropdown-menu slot="list">
                  <Dropdown-item v-for="(ops,index) in current.ds" :key="index" :name="index">{{ ops[1] }}</Dropdown-item>
              </Dropdown-menu>
            </Dropdown>
            <div v-else class="ds-static">
                <div v-for="(opt,i) in current.options" :key="i">
                  <Input v-model="opt.label" @on-change="optionsChange"></Input>
                  <Icon type="ios-remove-circle" @click="removeOptions(i)" />
                </div>
                <Button type="dashed" long @click="addOption" icon="md-add">添加选项</Button> 
            </div>
        </div>
        </li>
        <li v-if="current.type===6||current.type===7"><b>范围</b><p style="line-height:32px;width: 100%;"><i-Switch v-model="current.range"></i-Switch></p></li>
        <li v-if="current.type===10 || current.type===11"><b>上传地址</b><Input v-model="current.action"/></li>
        <li v-if="current.type===10 || current.type===11"><b>是否多选</b><p style="line-height:32px;width: 100%;"><i-Switch v-model="current.multi"></i-Switch></p></li>
      </ul>
    </div>
    <Modal v-model="layout.show" title="设置布局" @on-ok="setLayout">
      <p>行数:<Input v-model="layout.rows" type="number"></Input></p>
      <p>列数:<Input v-model="layout.columns" type="number"></Input></p>
    </Modal>
    <div class="merge-menu" :style="{'top':merge.menu.y+'px','left':merge.menu.x+'px'}" v-if="merge.show" @click="mergeCell">合并选择中单元格</div>
    <Modal v-model="layout.preview" title="预览" width="800" footer-hide>
      <div style="display: flex;flex-direction: column;">  
      <table class="preview data">
        <tr v-for="(columns,r) in layout.grid" :key="r">
          <td v-for="(col,c) in columns" v-if="col!==-1" :colspan="col%100>1?col%100:null" :rowspan="col>199?Math.floor(col/100):null" :key="r+'-'+c">
            <div v-for="(widget,i) in getWidgets(r,c)" :key="i">
              <b>{{widget.name}}</b>
              <w :model="widget"></w>
            </div>
          </td>
        </tr>
      </table>
      <p style="margin-left:auto;margin-right: 5%;height: 50px;line-height: 50px;" class="btn" @click="save"><Icon type="ios-create-outline" size="24" />确定</p>
      </div>
    </Modal>
  </div>
</template>
<script>
import Merge from "../logic/cell-merge";
import proto from "../logic/proto";
import code from "../logic/code";
import widTool from "../logic/custom-widget";
import w from "../components/widget"; 
import { random } from '@antv/x6/lib/util/number/number'; 
export default {
  name: "FormDesign",
  components:{w},
  props:['menuId','type','template','callBack'],
  data(){
    return {
      widgets:[
        {type:1,name:"文本框",icon:"ios-create-outline"},
        {type:2,name:"多行输入",icon:"ios-create-outline"},
        {type:13,name:"标签",icon:"md-document"},
        {type:3,name:"单选框组",icon:"md-radio-button-on",label:"Radio",options:[{label:'Radio1',value:'Radio1'},{label:'Radio2',value:'Radio2'},
        {label:'Radio3',value:'Radio3'}]},
        {type:4,name:"多选框组",icon:"md-checkbox",label:"Checkbox",options:[{label:'Checkbox1',value:'Checkbox1'},{label:'Checkbox2',value:'Checkbox2'},
        {label:'Checkbox3',value:'Checkbox3'}]},
        {type:5,name:"下拉选择框",icon:"md-arrow-dropdown",label:"Option",options:[{label:'Select1',value:'Select1'},{label:'Select2',value:'Select2'},
        {label:'Select3',value:'Select3'}]},
        {type:6,name:"时间选择器",icon:"ios-time",range:false},
        {type:7,name:"日期选择器",icon:"ios-calendar",range:false},
        {type:8,name:"评分",icon:"ios-star-outline"},
        {type:9,name:"开关",icon:"ios-switch"},
        {type:10,name:"图片",icon:"ios-image",multi:false},
        {type:11,name:"文件",icon:"md-cloud-upload",multi:false},
        {type:12,name:"富文本编辑",icon:"md-document"},
      ],
      current: {id:""},
      dragging:false,
      layout:{
        rows:1,columns:1,show:false,
        grid:[[0]],
        preview:false
      },
      forms:[],//【{type,name,position}】
      atomicId:"",
      merge:new Merge(),
      id:0,clear:[],//本次操作已删除控件对应的索引值key  
      noUsed:[],    //最大index前未使用的索引值key
      pageName:""//流程页面模板设置时，页面名称
    }
  },
  methods:{
    save(){      
      console.log(this.forms)
      let dbTemplates =widTool.parseTo(this.forms)
      console.log(dbTemplates)
      let layoutInfo=JSON.stringify(this.layout.grid)
      if(this.type==2 && this.pageName==""){
        this.$Message.info("请输入表单名称")
        return
      }
      this.$ws.addFunc(proto.EditTemplateInfoRsp, function (rsp) {
        if (rsp.code === code.OK) {         
          if(this.id<1 && this.type==0){//普通页面模板 insert
            this.$ws.addFunc(proto.BindTemplateRsp, function (rsp) {
              if (rsp.code !== code.OK) 
                this.$Message.error(code.Message(rsp.code))
            }, this)
            this.$ws.call(proto.BindTemplate,this.menuId,rsp.id,0);
          }
          this.$Message.info("保存成功");
          if(this.type==0)
            this.callBack(rsp.id,this.atomicId,layoutInfo,dbTemplates)
          else if(this.type==2)
            this.callBack(rsp.id,this.pageName,dbTemplates)
        }else
            this.$Message.error(code.Message(rsp.code))
        }, this)
                                            //id,模板字段数据集合,最大字段名index,布局,type:0:数据 ,1:员工 ,2:流程,页面名称：流程模板1 仅type=2时有效,当前form需要清除的字段集合                                            
      this.$ws.call(proto.EditTemplateInfo,this.id,dbTemplates,this.atomicId,layoutInfo,this.type,this.pageName,this.clear);
    },
    optionsChange(){
      this.current.op={t:0,ds:this.current.options.map(f=>f.label)}
    },
    checkData(index){
      let t=this.current.ds[index][0]
      this.current.curds.name=this.current.ds[index][1]
      console.log("checkData t:",t,' CUR:',this.current,"form:",this.forms)
      this.$ws.addFunc(proto.DataSourceInfoRsp, function (rsp) {
      this.current.options=[]
      JSON.parse(rsp.source.source).forEach(s=>{this.current.options.push({label:s,value:s})})
      console.log(rsp) 
      this.current.op={t:1,ds:rsp.source.id}
    }, this)
      this.$ws.call(proto.DataSourceInfo,t)
    },
    selectDataSource(type){
      console.log("type:",type,this.current)
      // this.current.isds=(type==1)?true:false//该方式复制，可能导致无法及时刷新v-if
      this.$set(this.current, 'isds', (type==1)?true:false)
      console.log("isds:",this.current.isds)
      if(type==2){//静态
        let names=this.current.options.map(item=>item.value)
        console.log("names:",names)
        this.current.op={t:0,ds:names}
        return
      }
      if(!this.current.curds){
        this.current.ds=[]
        this.current.curds={name:'基础数据源',id:-1}
      }
      this.$ws.addFunc(proto.DataOptionsRsp, function (rsp) {
        this.current.ds=rsp
        console.log("this.current.ds:",this.current.ds)
      }, this)
      this.$ws.call(proto.DataOptions)
    },
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
        }else{forms
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
    dragStart(e,widget){
      e.dataTransfer.setData('widget', JSON.stringify(widget))
      this.dragging=true
    },
    setAtomicId(type){
      console.log("before type:",type,"atomicId:",this.atomicId)  
      let index=""  
      if(type==2 || type==12){//多行+富文本
        let noUsed=widTool.getNoUsedList(this.forms,type,'')
        if(noUsed.length>0)index=noUsed[0] 
      }else{
        if(this.atomicId=="")this.atomicId=index="A"//首次
        else{
          if(this.clear.length>0){
            index=this.clear[0]
            this.clear.shift()
          }else if(this.noUsed.length>0){
            index=this.noUsed[0]
            this.noUsed.shift()
          }else{
            index=(this.atomicId.toDecimal()+1).toNumber52()
            this.atomicId=index
          }
        } 
      }
      console.log("after index:",index)  
      return index
    },
    dropWidget(e,row,col){
      e.preventDefault()
      e.stopPropagation()
      let widget=JSON.parse(e.dataTransfer.getData("widget"))
      if(widget.hasOwnProperty('options'))
        widget=Object.assign(widget,{isds:false,ds:[],curds:{name:'基础数据源',id:-1}})
        console.log("widget:",widget)
      widget.id= this.setAtomicId(widget.type)
      widget.pos=[row,col]
      widget.value=(widget.type==3||widget.type==5||widget.type==8)?0:widget.type==4?[]:widget.type==9?true:
    ((widget.type==6&&widget.range) || (widget.type==7&&widget.range))?['','']:''
    
      this.forms.push(widget)
      this.current = widget
      if(this.current.options && this.current.options.length>0)
        this.optionsChange()
      console.log("dropWidget current:",this.current)
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
      console.log(this.forms.findIndex(d=> d.type!=2&&d.type!=12&&d.id===id))
      if(this.forms.findIndex(d=> d.type!=2&&d.type!=12&&d.id===id)>-1){
        this.clear.push(id)
        this.clear=this.clear.sort()
      }
      let index=this.forms.findIndex(d=>d.id===id)
      if(index>-1){
          this.forms.splice(index,1)
          this.current={}
      }
    },
    init(template){
      console.log("init template:",template)
      if(!template || !template.data)return
      this.id=template.tid
      this.forms=widTool.recover(template.data)
      this.atomicId=template.index
      this.noUsed=widTool.getNoUsedList(this.forms,'',this.atomicId)
      console.log("noUsed:",this.noUsed)
      this.layout.grid = JSON.parse(template.layout)
      this.layout.rows = this.layout.grid.length
      for (let i = 0; i < this.layout.rows; i++) {
        if (this.layout.grid[i].length > this.layout.columns) {
          this.layout.columns = this.layout.grid[i].length
        }
      }
    }
  },
  mounted() {
    switch (this.type){
      case 0:
        //todo 数据设计页面 【list页面已查询后传参，不再重复查询】
        this.init(this.template)
        break
      case 1:
        //todo 员工信息模板页面
        this.$ws.addFunc(proto.EmployeeTemplateRsp,(rsp)=>{if(rsp.code == code.OK)this.init(rsp)},this)
        this.$ws.call(proto.EmployeeTemplate)
        break
      case 2:
        //todo 流程页面
      // this.$ws.addFunc(proto.TemplateInfoRsp, function (rsp) {
      // }, this) 
      // this.$ws.call(proto.TemplateInfo,0);
        break
    }
  }
}
</script>

<style scoped>
.design{display: flex;flex-direction:row;height: 100%;background: #fff;margin:0;padding:0}
.design>div>b:first-child{text-align: center;display: block;width:100%;background:#f1f1f1;height: 40px; border-bottom: 1px solid #ccc;line-height:40px}
.design .widget{width:240px;}
.design .widget>div{height: 30px;line-height: 30px;border: 1px solid #ccc;margin-top:10px;width:100px;padding-left:8px;display: inline-block;margin-right: 8px;margin-left:10px}
.design .widget>div .ivu-icon{font-size: 17px;margin-right:5px}

.design .form{flex: 1;border-left: 1px solid #ccc;border-right: 1px solid #ccc;}
.design .form>div:first-child{height: 40px; text-align: right;padding-right: 10px;line-height: 35px;border-bottom: 1px solid #ccc;}
.design .form>div:last-child{height: 100%;width: 100%;padding-top: 10px;}

.design .setting{width: 280px}
.design .setting ul{padding:8px;}
li{display: flex;line-height:40px}
li>b{text-align: left;border: 0;display: inline-block;width:80px;background:none;height: 40px;line-height:40px}
.active{border:1px solid #2b85e4 !important;}
.design .form>div:last-child>div>p{height:3px;background: #2c77eb;width:100%}
.ivu-icon{pointer-events: auto !important;}
.design .form>table{width: 100%;border-collapse: collapse;}
.design .form>table td{border: 1px dotted #ccc;line-height: 50px;height: 50px;}
.design .form>table>tr>td>div>p{height:3px;background: #2c77eb;width:100%}
.design .form>table>tr>td>div{ border: 1px dotted #f1f1f1;}
.design .form>table>tr>td>div .ivu-icon{color:#ed4014;float: right;font-size:20px;}
.design .form .current{border:1px solid #ed4014;border-radius: 3px;}
.merge-menu{position:fixed;width:120px;height: 30px;line-height: 30px;background: #f1f1f1;border: 1px solid #ccc;top:0;left:0; text-align: center;cursor: pointer}

.preview{width:100%;border-collapse: collapse;;margin:3% 0}
/* 数据源选项 */ 
.ds-type{display: flex;margin-bottom: 10px;}
.ds-type a{display: inline-block;color: #606266;height: 30px;line-height: 30px;padding: 0 8px;border:1px solid #cccccc;margin:0}
.ds-type a:nth-child(1){border-right:none;border-radius:5px 0 0 5px;}
.ds-type a:last-child{border-radius:0 5px 5px 0;}
.ds-type .tag{border:none;color: white;background-color:#93CDFF ;} 
/* 静态数据 */
.ds-static>div{display: flex;margin-bottom: 10px;}
.ds-static .ivu-input{width:60px !important;}
.ds-static .ivu-icon{font-size: 18px;margin:0 5px;line-height: 32px; color: #ff9900;cursor: pointer;}
.defVal .ivu-rate{width: 100%;}
</style>
