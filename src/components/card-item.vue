<template>
    <!-- 仪表盘 -->
    <Card padding="0" :style="[{'width':`${w[card.persent]}`},{'float':`left`},{'padding-bottom':'16px'},{'margin-left':'1%'}]">
        <p slot="title">
            <Icon type="ios-film-outline"></Icon>
            {{card.name}} 
        </p>
        <template v-if="card.type==1">
            <Table :columns="columns" :data="data"></Table>
        </template>
        <template v-else-if="card.type==2">
            <Table :columns="loadTabColumn(card.source)" :data="loadTabData(card.source)"></Table>
        </template>
    </Card>
</template>
<script>  
import widget from "../logic/widget" 
    export default {
        name:'card-item',
        props:['card'],
        data(){
            return {
                w:{'1':'100%','2':'49%','3':'32%','4':'24%',},
                columns:[],data:[]
            }
        },
        methods:{
            async loadTabColumn(){
                let dbTemplates=await widget.loadTemplateInfo(this.card.source);
                if(!dbTemplates || !dbTemplates.data || dbTemplates.data.length<1)return;
                dbTemplates.data.forEach(t=>{
                    this.columns.push({title:t.n,key:t.f})
                })
            },
            async loadTabData(){
              this.data=await widget.loadTemplateData(this.card.source,1,10); 
            },

        },
        created(){
            this.loadTabColumn();
            this.loadTabData();
        }
    }
</script> 