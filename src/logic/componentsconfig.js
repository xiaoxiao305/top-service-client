
// {
//   ui:1,// ui-type   1 input ,2 text,3 radio,4 checkbox,5 select,6 time,7 date
                     //8 rate,9 switch 
//   n:"姓名",//中文名称
//   f:""  //字段名
//   p:"" //占位符
//   d:"" //默认值
//   options:[],
//   r:0|1, 是否是范围【日期、时间】
//   s:[w,h] //图片
//   fi：“*.png|jpg”
//   m:1 //允许多张
//  }
const basicComponents = [
  {
    type: 'input',
    icon: 'icon-input',
    name:'单行文本',
    filed:'',
     
    ui:1,
    placeholder: '', 
    defaultValue:''
  },
  {
    type: 'textarea',
    icon: 'icon-diy-com-textarea',
    name:'多行文本',
    filed:'',
    
    ui:2,
    placeholder: '', 
    defaultValue:''
  },
  {
    type: 'radio',
    icon: 'icon-radio-active',
    name:'单选框组',
    filed:'',
    
    options: [
      {
        value: 'Option 1',
        label: 'Option 1'
      },
      {
        value: 'Option 2',
        label: 'Option 2'
      },
      {
        value: 'Option 3',
        label: 'Option 3'
      }
    ],
    ui:3,
  },
  {
    type: 'checkbox',
    icon: 'icon-check-box',
    name:'多选框组',
    filed:'',
    
    options: [
      {
        value: 'Option 1'
      },
      {
        value: 'Option 2'
      },
      {
        value: 'Option 3'
      }
    ], 
    ui:4,
  },
  {
    type: 'select',
    icon: 'icon-select',
    name:'下拉选择框',
    filed:'',
    
    options: [
      {
        value: 'Option 1'
      },
      {
        value: 'Option 2'
      },{
        value: 'Option 3'
      }
    ],
    ui:5
  },
  {
    type: 'time',
    icon: 'icon-time',
    name:'时间选择器',
    filed:'',
    
    isRange:0,//0具体时间 1时间范围
    ui:6,
  },
  {
    type: 'date',
    icon: 'icon-date',
    name:'日期选择器',
    filed:'',
    
    isRange:0,//0具体日期 1日期范围
    ui:7,
  },
  {
    type: 'rate',
    icon: 'icon-pingfen1',
    name:'评分',
    filed:'',
    
    defaultValue: null,
    ui:8,
  },
  {
    type: 'switch',
    icon: 'icon-switch',
    name:'开关',
    filed:'',
    
    defaultValue: false, 
    ui:9
  } ,
]
const dbTemplateFiled={
  "id":"id",
  "ui":"ui",// ui-type   1 input ,2 text,3 radio,4 checkbox,5 select,6 time,7 date
  //8 rate,9 switch 
  "name":"n",//   n:"姓名",//中文名称
  "filed":"f",//   f:""  //字段名
  "value":"v",// v:""//值
  "placeholder":"p", //   p:"" //占位符
  "defaultValue":"d",//   d:"" //默认值
  "options":"options", //选项
  "isRange":"r",//   r:0|1, 是否是范围【日期、时间】
  "size":"s",//   s:[w,h] //图片
  "fileType":"fi",//   fi：“*.png|jpg”
  "Multiple":"m",//   m:1 //允许多张
}
 
export default{
  basicComponents,dbTemplateFiled
} 
