<template>
    <div>
      <Button type="primary" style="position: fixed;top: 0;left: 50%;z-index: 100" @click="save">保存</Button>
      <div class="flowchart">
        <div ref="stencil" class="stencil"></div>
        <div ref="flowchart"></div>
      </div>
      <Drawer title="Basic Drawer"  v-model="attr.show" :title="attr.label+'属性设置'"  :mask-closable="false" width="480" :mask="false">
        <ul>
          <li><b>ID:</b>{{attr.id}}</li>
          <li><b>Name:</b><Input v-model="attr.label"/></li>
          <li v-if="attr.node"><b>Text:</b><Input v-model="attr.node.attrs.text.text"/></li>
          <li><b>节点背景色:</b><ColorPicker v-model="attr.color" @on-change="setNodeBackground"/></li>
          <li v-if="attr.node">{{ attr.node.data.fields }}</li> 
          <li v-if="attr.node">
            <Tabs type="card" :value="tb_pane_index" @on-click="switchTab">
                <Tab-pane name="tb_f" label="显隐字段"> 
                  <Table :columns="pageFields.cols" :data="attr.node.data.fields">
                 </Table>
                </Tab-pane>
                <Tab-pane name="tb_u_f" label="客户显隐字段">
                  <Table  :columns="pageFields.cols" :data="attr.node.data.user_fields">
                  </Table>
                </Tab-pane>
            </Tabs>
            </li> 
        </ul>
      </Drawer>
    </div>
  </template>
  <script>
  import { center } from '@antv/x6/lib/registry/node-anchor/bbox';
  import proto from "../logic/proto"
  import code from "../logic/code"
  import { Graph, Stencil } from '../logic/antv-x6'
  export default {
    name:"FlowChart",
    props:['template'],
    data () {
      return {
        graph:null,
        stencil:null,
        attr:{
          show:false,
          id :"node1",
          label:"",
          color:"",
          node:null,  
        },
          pageFields: {
            cols: [], fields: [
                { id: "A", name: '申请人', v: 1 },
                { id: "B", name: '报销金额', v: 1 }
            , { id: "C", name: '报销事由',  v: 1 }]
        },
        tb_pane_index:"tb_f"  
      }
    },
    mounted () {
      // 创建画布
      this.graph= Graph(this.$refs.flowchart)
      this.stencil=Stencil(this.graph)
      this.$refs.stencil.appendChild(this.stencil.container)
      this.bindGraphKey()
      // this.loadNodes()
    },
    methods: { 
      switchTab(name) {
        console.log(name)
        this.tb_pane_index=name
      },
      setNodeBackground(){
        this.attr.node.attr('body/fill', this.attr.color)
      },
      loadNodes(){
        //todo load nodes
        let rsp={
          code:1,
          nodes:[["node1",40,40,80,40,"开始节点",1],["node2",200,40,80,40,"next1",3],["node3",400,40,80,40,"next2",6],["node6",200,100,40,60,"next2",8]],
          edges:[["node1","node2"],["node2","node3"]]
        }
        // let rsp={
        //   code:1,
        //   nodes:[],
        //   edges:[]
        // }
        let nodes=[]
        let shapes={1:"custom-start",2:"custom-rect",3:"custom-process",4:"custom-polygon",5:"custom-data",6:"custom-circle",7:"custom-ellipse",8:"custom-cylinder"}
       
        rsp.nodes.forEach(node=>{
          console.log("loadnodes node:",node)
          nodes.push({id:node[0],x:node[1],y:node[2],width:node[3],height:node[4],label:node[5],shape:shapes[node[6]],data:{
              bizID: 125,
              date: '20200630',
            price: 89.00,
          }})
        })
        let edges=[]
        rsp.edges.forEach(edge=>{edges.push({source:{cell:edge[0],port:"right"},target:{cell:edge[1],port:"left"}})})
        this.graph.fromJSON({nodes:nodes,edges:edges})
      },
        save() { 
        let cells=this.graph.toJSON().cells
        let nodes=[],edges=[], lines = [];
          let shapes = { "custom-start": 1, "custom-process": 2, "custom-polygon": 3, "custom-circle": 4 }
        let ports={"top":1,"right":2, "bottom":3, "left":4 }
        cells.forEach(cell => {
          console.log("cell :", cell)
          if (cell.shape === "edge") {
              edges.push(cell)
            } 
        })
        cells.forEach(cell => {
            lines = []
              console.log("cellxx:", cell)
            if (cell.shape !== "edge") {
                edges.forEach(e => {
                  if (cell.id === e.source.cell) {
                    lines.push({
                      target: [e.target.cell, ports[e.target.port]],
                      name: e.attrs.line.text,
                      port:  ports[e.source.port]
                    })
                  }
                })
              let size=[60,30]
              if (cell.size){size=[cell.size.width,cell.size.height]}
              // nodes.push([cell.id,cell.position.x,cell.position.y,size[0],size[1],cell.attrs.text.text,shapes[cell.shape]])
              var n={
                id:cell.id,
                t:shapes[cell.shape], //类型 1:开始,2:过程,3:决策,4:结束
                name:cell.attrs.text.text,
                w:size[0], //
                h:size[1],
                x:cell.position.x,
                y:cell.position.y,
                bg:"#ff0", //节点背景颜色
                color:"#000", //节点字体颜色
                fields: this.initFields(cell.data.fields), //需要显示的字段id {A:1,B:2} 1 只读，2读&写
                user_fields: this.initFields(cell.data.user_fields),//[发起流程者]客户需要显示的字段id {A:1,B:2} 1 只读，2读&写
                acceptor:[],//默认受理组
                lines: lines
              }
              nodes.push(n)
            }
          })
              
          console.log("save nodes:",nodes)
          console.log("save edges:", edges) 
          return
          //todo:: 写入数据库 nodes,edges
          this.$ws.addFunc(proto.EditFlowchartRsp, function (rsp) {
            
          }, this) 
          var id=0
          // this.$ws.call(proto.EditFlowchart,id,this.template.id,this.template.name,nodes,true);
      },
      initFields(fields) {
          var newFields={}
         if (fields && fields.length > 0) {
          fields.forEach(f => {
            newFields[f.id] = f.v
          })
          console.log("newFields:", newFields)
          return newFields
        }
      },
      selectReset(){
        const nodes = this.graph.getNodes()
        const edges = this.graph.getEdges()
        nodes.forEach(node => {
          if (!node.data.fields || node.data.fields.length < 1) {
            this.pageFields.fields.forEach(f => {
              node.data.fields.push({id:f.id,name:f.name,v:f.v})
            })
          }
          if (!node.data.user_fields || node.data.user_fields.length < 1) {
            this.pageFields.fields.forEach(f => {
              node.data.user_fields.push({ id: f.id, name: f.name, v: f.v })
            })
          }
          node.attr('body/stroke', '#5F95FF');
        }) 
        edges.forEach(edge => {
          edge.attr('line/stroke', '#A2B1C3') 
          edge.attr('line/text', 'edgelabelname' + this.getRandom(10, 100))
          edge.prop('labels/0', {attrs: {body: {stroke: '#ffffff'}}})
        })
      },
      bindGraphKey() {
        let graph = this.graph
        graph.on('node:click', ({ e, x, y, node, view }) => { 
          this.selectReset()
          node.attr('body/stroke', 'orange') 
          //todo::Node 单击
          this.attr.show=true
          this.attr.id=node.id
          this.attr.label = node.label 
          this.attr.node=node   
        })
        graph.on('edge:click', ({ e, x, y, edge, view }) => {
          this.selectReset()
          edge.attr('line/stroke', 'orange') 
          edge.prop('labels/0', {attrs: {body: {stroke: 'orange'}}})
          edge.attr('line/text', 'edgelabelname'+this.getRandom(10,100))
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
        loadPage() {
        // this.pageFields.fields=this.template.fields
        this.pageFields.cols = [{ title: '名称', key: 'name' }]
        this.pageFields.cols.push({
          title: "只读",
          render: (h, params) => {
            return h('div', [
              h("Checkbox", {
                props: { value: params.row.v == 1 ? true : false },
                on: {
                  "on-change": (val) => {
                    params.row.v = val ? 1 : 0;
                      console.log("tb_pane_index:", this.tb_pane_index)
                      if (this.tb_pane_index == "tb_f") {
                        this.attr.node.data.fields.forEach(f => {
                          if (f.id == params.row.id)  f.v = params.row.v 
                        });
                    }
                    else if (this.tb_pane_index == "tb_u_f")
                      this.attr.node.attrs.data.user_fields.forEach(f => { if (f.id == params.row.id) f.v = params.row.v })

//console
                      const nodes = this.graph.getNodes()
                    nodes.forEach(node => { console.log(JSON.stringify(node)) })
 
                  }
                }
              })])
          }
        });
        this.pageFields.cols.push({
          title: "编辑",
          render: (h, params) => {
            return h('div', [
              h("Checkbox", {
                props: { value: params.row.v == 2 ? true : false },
                on: {
                  "on-change": (val) => {
                      params.row.v = val ? 2 : 0; 
                    if (this.tb_pane_index == "tb_f")
                      this.attr.node.data.fields.forEach(f => {if (f.id == params.row.id) f.v = params.row.v});
                    else if (this.tb_pane_index == "tb_u_f")
                      this.attr.node.data.user_fields.forEach(f => { if (f.id == params.row.id) f.v = params.row.v })
                  }
                }
              })])
          }
        });  
      },
      getRandom(min,max) {
        return Math.floor(Math.random() * (max - min) + min);
      }
    },
    created(){
      this.loadPage();
    }
  };
  </script>
  
  <style scoped>
  .flowchart{width: 100%;height:80vh;display: flex;flex-direction: row}
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
  