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
            loadTabColumn(){
                if(this.card.source<1)return
                this.$ws.addFunc(proto.TemplateInfoRsp, function (rsp) {
                    if (rsp.code === code.OK) { 
                        let dbTemplates={};
                        if(rsp.data && rsp.data.length>0)
                            dbTemplates={data:JSON.parse(rsp.data),index:rsp.index,tid:rsp.tid};
                        if(!dbTemplates || !dbTemplates.data || dbTemplates.data.length<1)return;
                        this.columns=[]
                        dbTemplates.data.forEach(t=>{this.columns.push({title:t.n,key:t.f})})
                    }
                }, this)
                this.$ws.call(proto.TemplateInfo,this.card.source); 
            },
            loadTabData(){
                if(this.card.source<1)return
                this.$ws.addFunc(proto.TemplateDataRsp, function (rsp) {
                    if (rsp.code === code.OK) { 
                        this.data=[];
                        let rspD={}
                        for(let i=0;i<rsp.data.length;i++){
                            rspD=JSON.parse(rsp.data[i]);
                            rspD.id=rsp.id[i];
                            this.data.push(rspD)
                        }
                    }
                }, this)
                this.$ws.call(proto.TemplateData,this.card.source,page,size); 
            },
        },
        created(){
            this.loadTabColumn();
            this.loadTabData();
        }
    }
</script> 