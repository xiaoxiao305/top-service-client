import RichEditor from "./../components/rich-editor.vue";
const Widget = {
  components:{RichEditor},
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
  options: "op",    //选项
  range: "r",       //0|1, 是否是范围【日期、时间】
  size: "s",        //s:[w,h] //图片
  filter: "ft",     //fi：“*.png|jpg”
  multi: "m",       //m:1 //允许多张
  pos: "ps"         //行列布局
}
const parseTo=function (forms){
  let items=[]
  forms.forEach(widget=>{
    let item={}
    for(let k in widget){
      if (fields.hasOwnProperty(k)){
        item[fields[k]]=widget[k]
      }
    }
    items.push(item)
  })
  return items
}
const recover=function(widgets){
  let forms=[]
  widgets.forEach(widget=>{
    let item={}
    widget["v"]=""
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
export default {Widget,parseTo,recover}
