<template>
<div>
    <Steps :current="currentIndex">
        <Step title="进行中" content="表单设计"></Step>
        <Step title="待进行" content="流程设计1"></Step> 
    </Steps> 
    <template v-if="currentIndex==1">
        <form-design :type=2 :callBack="next"></form-design>
        <i-button type="primary" @click="next">下一步</i-button>
    </template>
    <template v-else>
        <flow-chart :template="template"></flow-chart> 
        <i-button type="primary" @click="pre">上一步</i-button>
    </template>
</div>
</template>
<script>
import FormDesign from './form-design.vue';
import FlowChart from './flow-chart.vue';
    export default {
    name:"SysManage",
    components:{FormDesign,FlowChart},
    data(){
        return {
            currentIndex:1,
            template:{},
        }
    },
    methods:{
        pre(){
            this.currentIndex-=1
        },
        next(tid,pageName,dbTemplates){           
            // let fields=[]
            // dbTemplates.map(f=>{
            //     fields.push({id:f['id'],name:f['n'],v:0})
            // }) 
            // this.template = { tid: tid, name: pageName, fields: fields }
            // this.template={tid:101,name:"报销流程",fields:[{ id: 1, name: '申请人', s: '', n: '', v: 1 }, { id: 2, name: '报销金额', s: '', n: '', v: 1 }
            //         , { id: 3, name: '报销事由', s: '', n: '', v: 1 }]}
            this.currentIndex+=1
        },
        test(){
            console.log("this is farthod's callback")
        }
    }
        
    }
</script>
