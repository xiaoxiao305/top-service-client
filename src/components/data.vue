<template>
<!-- 模板功能 编辑数据 -->
<div style="display: flex;flex-direction: column;">  
  <table class="preview data">
    <tr v-for="(columns,r) in templateForm.layout" :key="r">
        <td v-for="(col,c) in columns" v-if="col!==-1" :colspan="col%100>1?col%100:null" :rowspan="col>199?Math.floor(col/100):null" :key="r+'-'+c">
          <div v-for="(widget,i) in widgets(r,c)" :key="i">
            <b>{{widget.name}}</b>
            <w :model="widget" :handleUpload="handleUpload"></w>
          </div>
        </td>
    </tr>
  </table>
  <p style="margin-left:auto;margin-right: 5%;height: 50px;line-height: 50px;" class="btn" @click="save((model&&model.id)?model.id:0,tid,forms)"><Icon type="ios-create-outline" size="24" />保存</p>
</div> 
</template>
<script>   
import widget from "../logic/custom-widget"; 
import w from "../components/widget"; 
export default {
  name: "ui-data", 
  components:{w},
  props:['model','save','template'],
  data(){
    return{ 
      layout:{rows:0,columns:0,grid:[]},
      forms:[], 
      tid:0,templateForm:{layout:[],widgets:[]},
      files:{}
    }
  }, 
  methods:{
    handleUpload(model,file){
      if(!this.files[model.id])this.files[model.id]=[]
      this.files[model.id].push(file)
      this.forms=this.forms.map(f=>{
         if(f.id==model.id)
          f.value=this.files[model.id]
        return f
      })
      console.log("this.forms:",this.forms)
    },
    widgets(row,col){
      let widgets=[]
      for (let i=0;i<this.forms.length;i++){
        let widget=this.forms[i]
        if (widget.pos[0]==row && widget.pos[1]==col){
          for (var key in this.model) { 
            if(widget.id==key)widget.value=this.model[key]
          }
          widgets.push(widget)
        }
      }
      return widgets
    }, 
    init(template){
      console.log(template)
      if(!template || !template.data)return
      this.tid=template.tid
      this.forms=widget.recover(template.data)
      this.templateForm={layout:JSON.parse(template.layout),widgets:widget.recover(template.data)}
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
.preview{width:100%;border-collapse: collapse;margin:3%} 
</style>

 