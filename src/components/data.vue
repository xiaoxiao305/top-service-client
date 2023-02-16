<template>
  <!-- 模板功能 编辑数据 -->
  <table class="preview">
    <Button type="primary" @click="save((model&&model.id)?model.id:0,tid,forms)">保存</Button>
    <tr v-for="(columns,r) in templateForm.layout" :key="r">
        <td v-for="(col,c) in columns" v-if="col!==-1" :colspan="col%100>1?col%100:null" :rowspan="col>199?Math.floor(col/100):null" :key="r+'-'+c">
          <div v-for="(widget,i) in widgets(r,c)" :key="i" >
            <b>{{widget.name}}</b><widget :model="widget"></widget>
          </div>
        </td>
    </tr>
  </table>
  </template>
  <script>   
    import widget from "../logic/custom-widget"; 
    export default {
      name: "ui-data", 
      components:{"Widget":widget.Widget},
      props:['model','save','template'],
      data(){
        return{ 
          layout:{rows:0,columns:0,grid:[]},
          forms:[], 
          tid:0,templateForm:{layout:[],widgets:[]},
        }
      }, 
      methods:{ 
        widgets(row,col){
          let widgets=[]
          for (let i=0;i<this.forms.length;i++){
            let widget=this.forms[i]
            if (widget.pos[0]==row && widget.pos[1]==col){
              widgets.push(widget)
            }
          }
          return widgets
        }, 
        init(template){ 
          if(!template || !template.data)return
          this.tid=template.tid
          let fields=JSON.parse(template.data)
          this.forms=widget.recover(fields)
          this.templateForm={layout:JSON.parse(template.layout),widgets:widget.recover(fields)}
          this.atomicId=template.index
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
        this.init(this.template)
      }
    }
    </script> 
  <style scoped>
  .component{margin-top:8px;border: 1px solid #ccc;border-radius: 3px;padding: 8px 0;}
  .component b{height:40px;line-height:40px;padding-left: 8px;padding-right: 8px;}
  .component input,select,textarea,option,label{height:40px;line-height: 40px;width: auto;}
  </style>