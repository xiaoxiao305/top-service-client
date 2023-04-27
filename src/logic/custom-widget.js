import RichEditor from "./../components/rich-editor.vue";
import proto from "../logic/proto"
const Widget = {
  components:{RichEditor},
  props:['model'],
  render(createElement) {
    let ui={1:"Input",2:"Input",3:"RadioGroup",4:"CheckboxGroup",5:"Select",6:"TimePicker",7:"DatePicker",8:"Rate",9:"i-Switch",10:"Upload",11:"Upload",12:"rich-editor",999:"p"}
    let children =[]
    console.log(this.model)
    if (this.model.label){
      // if (!this.model.options){
        if (!this.model.op){
        // this.current.op={t:1,ds:this.current.curds.id}
        // this.$set(this.model, 'options',[{value:1,label:this.model.label+1},{value:2,label:this.model.label+2},{value:3,label:this.model.label+3}])
        this.$set(this.model, 'op',{t:0,ds:[this.model.label+1,this.model.label+2,this.model.label+3]})
      }
      // this.model.options.forEach(opt=>{children.push(createElement(this.model.label, {attrs: {value: opt.value}},opt.label))})
      this.model.op.ds.forEach(opt=>{children.push(createElement(this.model.label, {attrs: {value: opt}},opt))})
      console.log("this.model.op.ds:",this.model.op.ds)
    }
    let data={domProps:{value: this.model.name},attrs:{value:this.model.value}}
    if (this.model.hasOwnProperty("value")){data.attrs.value=this.model.value}
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
const fields= {
  id: "id",
  type: "t",        // ui-type   1 input ,2 text,3 radio,4 checkbox,5 select,6 time,7 date 8 rate,9 switch  10:"Upload",11:"Upload",12:"rich-editor"
  name: "n",        //   n:"姓名",//中文名称
  value: "v",       // v:""//值
  placeholder: "p", //   p:"" //占位符
  def: "d",         //默认值
  options: "options",    //选项
  op: "op",    //选项
  range: "r",       //0|1, 是否是范围【日期、时间】
  size: "s",        //s:[w,h] //图片
  filter: "ft",     //fi：“*.png|jpg”
  multi: "m",       //m:1 //允许多张
  pos: "ps",         //行列布局
  action:"ac"//图片地址
}
const parseTo=function (forms){
  let items=[]
  forms.forEach(widget=>{
    let item={}
    for(let k in widget){
      if (fields.hasOwnProperty(k)){
        //bool值转换为0或1传给服务器
        item[fields[k]]=typeof(widget[k])=='boolean'?(widget[k]?1:0):widget[k]
      }
    }
    items.push(item)
  })
  return items
}
const recover=function(widgets){
  let forms=[]
  console.log(typeof widgets)
  widgets.forEach(widget=>{
    let item={}
    widget["v"]=(widget.t==3||widget.t==5||widget.t==8)?0:widget.t==4?[]:widget.t==9?true:
    ((widget.t==6&&widget.r) || (widget.t==7&&widget.r))?['','']:''
    for (let k in widget){
      for (let attr in fields){
        if (fields[attr]===k) {
          item[attr] = widget[k]
          break
        }
      }
    }
    forms.push(item)
  })
  return forms
}   
/*
type 控件类型
forms 该模板数据
noUsedList 返回当前模板未使用的type类型控件id集合 如['DS','DT'...]
*/
const getNoUsedList=function(forms,type,index){
  console.log('getNoUsedList index:',index,'type:',type,'forms:',forms)
  let list=[],used=[],noUsed=[]
  if(type==2 || type==12){
    for(let i=0;i<(type==2?6:type==12?8:0);i++){
      list.push((((type==2?'DM':type==12?'DS':'')).toDecimal()+i).toNumber52())
    }
    used=Array.from(forms.filter(f => f.type==type),({id})=>id);
  }else{
    for(let i=0;i<index.toDecimal()+1;i++){
      list.push(i.toNumber52())
    }
    used = Array.from(forms,({id})=>id);
  } 
  //差集 数组list相对于used所没有的
  noUsed=list.filter(item=>used.indexOf(item)==-1);
  console.log("差集",noUsed); 
  return noUsed
}
export default {Widget,parseTo,recover,getNoUsedList}
