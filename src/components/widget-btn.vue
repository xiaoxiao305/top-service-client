<template>
    <ul class="widget-btn">
        <li v-for="(model,m) in models" :key="m" draggable="true" 
        @dragend="dragEnd(model)" @dragover="dragOver($event)">
        <Icon class="ico" :type="model.icon" />{{ model.name }}</li>
    </ul>
</template>
<script>
import cc from '@/logic/componentsconfig'
export default {
    name:"widget-btn",
    props:['items'],
    data(){
        return{
            models:[],
        }
    },
    methods:{
        dragOver(e){
            e.preventDefault()
        },
        dragEnd(model){
            var widgetIndex=this.items.length;
            var lastItem=this.items.slice(-1);
            var filedIndex=lastItem && lastItem.length>0?lastItem[0].filed:"";
            var newModel=JSON.parse(JSON.stringify(model));
            newModel.id=widgetIndex+1;
            newModel.filed=(filedIndex.toDecimal()+1).toNumber52();
            this.$emit('dragWidget',newModel)
            this.items.push(newModel);
        },
    },
    created(){
        this.models=cc.basicComponents;
    }

}
</script>
<style scoped> 
.widget-btn li{width:45%;height:30px;line-height:30px;text-align: center; 
    background:#F4F6FC;margin:4px;}
.widget-btn li .ico{height:16px;margin-right: 4px;}
</style>
