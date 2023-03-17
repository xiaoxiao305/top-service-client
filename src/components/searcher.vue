<template>
    <Form>
        <FormItem v-for="(item,index) in items"
        :key="index"
        :label="'条件' + (index+1) + '：'">
            <Row :gutter="3">
                <Col span="7">
                    <Select v-model="item.id" placeholder="请选择查询字段" @on-change="selectField(item)">
                        <Option v-for="i in template.filter(t => {if(t.t!=10 && t.t!=11 && t.t!=12) {return t}})" :value="i.id" :key="i.id">{{ i.n }}</Option>
                    </Select>
                </Col>
                <Col span="3">
                    <Select v-model="item.symbol" placeholder="条件" clearable>
                        <Option v-for="i in symbolList" :value="i.value" :key="i.value">{{ i.label }}</Option>
                    </Select>
                </Col>
                <Col span="7"><w :model="item" :key="randomKey"></w></Col>
                <Col span="4"><Icon style="line-height: 32px; color: #ff9900;cursor: pointer;" type="ios-remove-circle" size="24" @click="handleSearchRemove(index)" /></Col>
            </Row>
         </FormItem>   
        <FormItem><Button type="dashed" long @click="handleSearchAdd" icon="md-add">添加条件</Button></FormItem>
        <FormItem><Button type="primary" @click="searchList">查询</Button></FormItem>
    </Form>
</template>
<script>
    import w from '../components/widget'
    import widget from '../logic/custom-widget'
    
    export default{
        name:"searcher",
        components:{w,widget},
        props:['template','search'],
        data(){
            return{
                symbolList: [{ value: 'eq', label: '=' }, { value: 'con', label: '包含' }, 
                { value: 'like', label: '模糊查询' }, { value: 'ge', label: '≧' }, { value: 'le', label: '≦' }
                ,{ value: 'ne', label: '≠' }, { value: 'gt', label: '>' }, { value: 'lt', label: '<' }],
                index:1,//当前查询条件位置
                randomKey:"",//用于通知子组件刷新数据
                items: [{value: '',id: '', }]
            }
        },
        methods:{  
            //组装查询内容
            searchList(){
                if(this.items.length<1 || this.items[0].id =='')return;
                let s=[]
                this.items.forEach(f=>{
                    s.push({key:f.id,val:f.value,op:this.symbolList.findIndex(s=>s.value==f.symbol)})
                })
                this.search(s)
            },
            //根据选择不同查询字段【不同数据类型】，显示对应数据类型控件
            selectField(item){
                let t=this.template.find(t=>{if(t.id==item.id)return t})
                item=Object.assign(item,widget.recover([t])[0])
                this.randomKey=Math.random();//刷新子控件
            },
            //添加查询条件
            handleSearchAdd () {
                this.index++
                this.items.push({id: '',value: ''})
            },
            //移除查询条件
            handleSearchRemove (index) { 
                this.index--
                this.items.splice(index, 1)
            }
        }
    }
</script> 
<style scoped>
form{padding:20px 12px;text-align: center;width:80%;margin:0 auto}
</style>