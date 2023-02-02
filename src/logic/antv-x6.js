//import X6 from "@antv/x6";
import {Addon, Graph as X6Graph, Shape} from "@antv/x6";
const ports = {groups: {}, items: []}
const direction=["top","right","bottom","left"]
direction.forEach(dir=>{
  ports.items.push({group:dir,id:dir})
  ports.groups[dir]={
    position: dir,
    id:dir,
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#5F95FF',
        strokeWidth: 1,
        fill: '#fff',
        style: {visibility: 'hidden'},
      },
    },
  }
})
const nodes=[
  {name:"custom-rect",inherit:"rect",w:66,h:36},
  {name:"custom-start",inherit:"rect",w:66,h:36,body:{rx:20,ry:26}},
  {name:"custom-process",inherit:"rect",w:66,h:36,body:{rx:6,ry:6}},
  {name:"custom-polygon",inherit:"polygon",w:66,h:36,body:{refPoints:"0,10 10,0 20,10 10,20"}},
  {name:"custom-data",inherit:"polygon",w:66,h:36,body:{refPoints:"10,0 40,0 30,20 0,20"}},
  {name:"custom-circle",inherit:"circle",w:45,h:45},
  {name:"custom-ellipse",inherit:"ellipse",w:66,h:36},
  {name:"custom-cylinder",inherit:"cylinder",w:30,h:45,attrs:{top:{fill: '#EFF4FF',strokeWidth: 1, stroke: '#5F95FF'}}},
]
nodes.forEach(node=> {
  let entity = {
    inherit: node.inherit,
    width: node.w,
    height: node.h,
    attrs: {
      body: Object.assign({strokeWidth: 1, stroke: '#5F95FF', fill: '#EFF4FF'},node.body),
      text: {fontSize: 12, fill: '#262626'},
    },
    ports: {...ports},
  }
  entity.attrs=Object.assign(entity.attrs,node.attrs)
  X6Graph.registerNode(node.name, entity, true)
})
X6Graph.registerEdge("edge", {attrs: {line: {stroke: '#A2B1C3', strokeWidth: 2}}, zIndex: 0}, true)
function bindGraphKey(graph,container){
  graph.bindKey(['meta+c', 'ctrl+c'], () => {
    const cells = graph.getSelectedCells()
    if (cells.length) {
      graph.copy(cells)
    }
    return false
  })
  graph.bindKey(['meta+x', 'ctrl+x'], () => {
    const cells = graph.getSelectedCells()
    if (cells.length) {
      graph.cut(cells)
    }
    return false
  })
  graph.bindKey(['meta+v', 'ctrl+v'], () => {
    if (!graph.isClipboardEmpty()) {
      const cells = graph.paste({offset: 32})
      graph.cleanSelection()
      graph.select(cells)
    }
    return false
  })
  graph.bindKey(['meta+z', 'ctrl+z'], () => {
    if (graph.history.canUndo()) {
      graph.history.undo()
    }
    return false
  })
  graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
    if (graph.history.canRedo()) {
      graph.history.redo()
    }
    return false
  })
  graph.bindKey(['meta+a', 'ctrl+a'], () => {
    const nodes = graph.getNodes()
    if (nodes) {
      graph.select(nodes)
    }
  })
  graph.bindKey(['backspace',"delete"], () => {
    const cells = graph.getSelectedCells()
    if (cells.length) {graph.removeCells(cells)}
  })
  graph.bindKey(['ctrl+1', 'meta+1'], () => {
    const zoom = graph.zoom()
    if (zoom < 1.5) {
      graph.zoom(0.1)
    }
  })
  graph.bindKey(['ctrl+2', 'meta+2'], () => {
    const zoom = graph.zoom()
    if (zoom > 0.5) {
      graph.zoom(-0.1)
    }
  })

  // 控制连接桩显示/隐藏
  graph.on('node:mouseenter', () => {
    const ports = container.querySelectorAll('.x6-port-body',)
    ports.forEach(port=>port.style.visibility = 'visible')
  })
  graph.on('node:mouseleave', () => {
    const ports = container.querySelectorAll('.x6-port-body')
    ports.forEach(port=>port.style.visibility = 'hidden')
  })
  graph.on('edge:mousedown', () => {
    const ports = container.querySelectorAll('.x6-port-body',)
    ports.forEach(port=>port.style.visibility = 'visible')
  })

}
export const Graph=(container)=>{
  let graph=new X6Graph({
    container: container,
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl',
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      router: {
        name: 'manhattan',
        args: {padding: 1},
      },
      connector: {
        name: 'rounded',
        args: {radius: 8},
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {radius: 50},
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        })
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#5F95FF',
            stroke: '#5F95BB',
            'stroke-width': 2
          },
        },
      },
    },
    resizing: true,
    rotating: true,
    selecting: {
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
    },
    snapline: true,
    keyboard: true,
    clipboard: true,
    grid: {
      size: 10,
      visible: true,
      type: 'doubleMesh',
      args: [
        {
          color: '#eee', // 主网格线颜色
          thickness: 1,     // 主网格线宽度
        },
        {
          color: '#ddd', // 次网格线颜色
          thickness: 1,     // 次网格线宽度
          factor: 4,        // 主次网格线间隔
        },
      ],
    },
  })
  bindGraphKey(graph,container)
  return graph
}
export const Stencil=(graph)=>{
  let stencil= new Addon.Stencil({
    title: '流程图',
    target: graph,
    stencilGraphWidth: 200,
    stencilGraphHeight: 560,
    collapsable: true,
    groups: [{title: '基础流程图', name: 'flowchart'}],
    layoutOptions: {columns: 2,columnWidth: 80,rowHeight: 55},
  })
  let shapes=[
    {label:"开始",type:"start"},
    {label:"过程",type:"process"},
    {label:"可选过程",type:"rect"},
    {label:"决策",type:"polygon"},
    {label:"数据",type:"data"},
    {label:"连接",type:"circle"},
    {label:"流程",type:"ellipse"},
    {label:"存储",type:"cylinder"},
  ]
  let nodes=[]
  shapes.forEach(item=>{nodes.push(graph.createNode({shape: "custom-" + item.type,label: item.label}))})
  stencil.load(nodes, 'flowchart')
  return stencil
}
