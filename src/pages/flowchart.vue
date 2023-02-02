<template>
  <div>
    <Button type="primary" style="position: fixed;top: 0;left: 50%;z-index: 100" @click="save">保存</Button>
    <div class="flowchart">
      <div class="stencil" ref="stencil"></div>
      <div ref="flowchart"></div>
    </div>
    <Drawer title="Basic Drawer"  v-model="attr.show" :title="attr.label+'属性设置'"  :mask-closable="false" width="480" :mask="false">
      <ul>
        <li><b>ID:</b>{{attr.id}}</li>
        <li><b>Name:</b><Input v-model="attr.label"  @on-blur="inputChange"  /></li>
        <li><b>节点背景色:</b><ColorPicker v-model="attr.color" @on-change="setNodeBackground"/></li>
        <li><b>绑定页面</b>
          <Dropdown @on-click="loadFiledTemp">
            <a href="javascript:void(0)">
              {{ fatherText }}
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <Dropdown-menu slot="list" >
              <template v-for="dd in pages" >
                <Dropdown-item :key="dd.id" :name="JSON.stringify(dd)">{{dd.name}}</Dropdown-item>
              </template>
            </Dropdown-menu>
          </Dropdown>
        </li>
        <li v-if="filedData.length>0"><b>字段显隐</b>
          <Table  :columns="filedCols" :data="filedData"></Table  >
        </li>
      </ul>
    </Drawer>
  </div>
</template>
<script>
import { center } from '@antv/x6/lib/registry/node-anchor/bbox';
import { Graph, Stencil } from '../logic/antv-x6'
export default {
  components: {
  },
  data () {
    return {

      graph:null,
      stencil:null,
      attr:{
        show:false,
        id :"node1",
        label:"",
        color:"",
        node:null
      },

      fatherText:"页面名称",pages:[],filedCols:[],filedData:[]
    }
  },
  mounted () {
    // 创建画布
    this.graph= Graph(this.$refs.flowchart)
    this.stencil=Stencil(this.graph)
    this.$refs.stencil.appendChild(this.stencil.container)
    this.bindGraphKey()
    this.loadNodes()
  },
  methods: {
    inputChange(){
      // this.attr.node.attrs.text.text=this.attr.label
    },
    setNodeBackground(){
      this.attr.node.attr('body/fill', this.attr.color)
    },
    loadNodes(){
      //todo load nodes
      // let rsp={
      //   code:1,
      //   nodes:[["node1",40,40,80,40,"开始节点",1],["node2",200,40,80,40,"next1",3],["node3",400,40,80,40,"next2",6],["node6",200,100,40,60,"next2",8]],
      //   edges:[["node1","node2"],["node2","node3"]]
      // }
      let rsp={
        code:1,
        nodes:[],
        edges:[]
      }
      let nodes=[]
      let shapes={1:"custom-start",2:"custom-rect",3:"custom-process",4:"custom-polygon",5:"custom-data",6:"custom-circle",7:"custom-ellipse",8:"custom-cylinder"}
      rsp.nodes.forEach(node=>{
        nodes.push({id:node[0],x:node[1],y:node[2],width:node[3],height:node[4],label:node[5],shape:shapes[node[6]]})
      })
      let edges=[]
      rsp.edges.forEach(edge=>{edges.push({source:{cell:edge[0],port:"right"},target:{cell:edge[1],port:"left"}})})
      this.graph.fromJSON({nodes:nodes,edges:edges})
    },
    save(){
      let cells=this.graph.toJSON().cells
      let nodes=[],edges=[];
      console.log(cells)
      let shapes={"custom-start":1,"custom-rect":2,"custom-process":3,"custom-polygon":4,"custom-data":5,"custom-circle":6,"custom-ellipse":7,"custom-cylinder":8}
      cells.forEach(cell=>{
        if (cell.shape==="edge"){
          edges.push([cell.source.cell,cell.target.cell])
        }else{
          let size=[60,30]
          if (cell.size){size=[cell.size.width,cell.size.height]}
          nodes.push([cell.id,cell.position.x,cell.position.y,size[0],size[1],cell.attrs.text.text,shapes[cell.shape]])
        }
      })

      console.log(nodes,edges)
      //todo:: 写入数据库 nodes,edges
    },
    selectReset(){
      const nodes = this.graph.getNodes()
      const edges = this.graph.getEdges()
      nodes.forEach(node => {node.attr('body/stroke', '#5F95FF')})
      edges.forEach(edge => {
        edge.attr('line/stroke', '#A2B1C3')
        edge.prop('labels/0', {attrs: {body: {stroke: '#A2B1C3'}}})
      })
    },
    bindGraphKey() {
      let graph = this.graph
      graph.on('node:click', ({ e, x, y, node, view }) => {
        this.selectReset()
        node.attr('body/stroke', 'orange')
        //todo::Node 单击
        console.log(node)
        this.attr.show=true
        this.attr.id=node.id
        this.attr.label=node.label
        this.attr.node=node
      })
      graph.on('edge:click', ({ e, x, y, edge, view }) => {
        this.selectReset()
        edge.attr('line/stroke', 'orange')
        edge.prop('labels/0', {attrs: {body: {stroke: 'orange'}}})
      })
      graph.on("blank:click",({ e, x, y, node, view }) => {
        this.selectReset()
        this.attr.id=""
        this.attr.label=""
        this.attr.show=false
        this.attr.node=null
      })
      console.log("graph:",graph)
    },
    loadPage(){
      this.pages=[]
      console.log("store['flowpage']:",store['flowPage'])
      let ps=store['flowPage']?JSON.parse(store['flowPage']):{};
      for(let k in ps){
        this.pages.push({id:ps[k].id,name:ps[k].name,tid:ps[k].tid})
      } 
      console.log("pages:",this.pages)
    },
    loadFiledTemp(modelN){
      let model=JSON.parse(modelN)
      console.log("loadFiledTemp model:",model)
      this.fatherText=model.name;
      console.log("this.filedColsTmp:",this.filedColsTmp)
      //cols
      this.filedCols=[{title: '名称',key: 'name'}]
      this.filedCols.push({title:"显示",
        render: (h, params) => {
          return h('div',[
            h("Checkbox",{
                    props: {value:params.row.v==1?true:false},
                    on: {
                      "on-change":(val) => {
                        params.row.v=params.row.v==0?1:0;
                      }
                    }
                  })])
            }});
      this.filedCols.push({title:"隐藏",
        render: (h, params) => {
          return h('div',[
            h("Checkbox",{
                    props: {value:params.row.v==0?true:false},
                    on: {
                      "on-change":(val) => {
                        params.row.v=params.row.v==1?0:1;
                      }
                    }
                  })])
            }}); 
      //data
      this.filedData=[];
      let fileds=store['pageFiled']?JSON.parse(store['pageFiled']):{}
      console.log("fileds:",fileds)
      if(fileds[model.tid]){
        fileds[model.tid].map(f=>{
          console.log("f:",f)
        this.filedData.push({name:f['n'],s:'',n:'',v:1})
        })
        console.log("filedData:",this.filedData)
      }
    }
  },
  created(){
    this.loadPage();
  }
};
</script>

<style scoped>
.flowchart{width: 100%;height:100vh;display: flex;flex-direction: row}
.flowchart>div:nth-child(2){flex:1;height: 100%;}
.stencil{width: 180px;height: 100%;border-right: 1px solid #dfe3e8;position: relative;}
.x6-widget-stencil  {
  background-color: #fff;
}
.x6-widget-stencil-title {
  background-color: #fff;
}
.x6-widget-stencil-group-title {
  background-color: #fff !important;
}
.x6-widget-transform {
  margin: -1px 0 0 -1px;
  padding: 0px;
  border: 1px solid #239edd;
}
.x6-widget-transform > div {
  border: 1px solid #239edd;
}
.x6-widget-transform > div:hover {
  background-color: #3dafe4;
}
.x6-widget-transform-active-handle {
  background-color: #3dafe4;
}
.x6-widget-transform-resize {
  border-radius: 0;
}
.x6-widget-selection-inner {
  border: 1px solid #239edd;
}
.x6-widget-selection-box {
  opacity: 0;
}
ul{width: 100%}
ul>li{width:100%;line-height: 30px;}
ul>li>b{display: inline-block;width: 100px;}

</style>
