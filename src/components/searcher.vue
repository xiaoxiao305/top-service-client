<template>
    <Form>
        <FormItem
        v-for="(item,index) in formDynamic.items"
        :key="index"
        :label="'条件' + (index+1) + '：'">
            <Row :gutter="3">
                <Col span="7">
                    <Select v-model="item.field" placeholder="请选择查询字段" @on-change="selectField(item.field,item)">
                        <Option v-for="i in JSON.parse(template).map(t => {if(t.t!=10 && t.t!=11 && t.t!=12) {return t}}).filter(ite => typeof ite !== 'undefined')" :value="i.id" :key="i.id">{{ i.n }}</Option>
                    </Select>
                </Col>
                <Col span="3">
                    <Select v-model="item.symbol" placeholder="条件" clearable>
                        <Option v-for="i in symbolList" :value="i.value" :key="i.value">{{ i.label }}</Option>
                    </Select>
                </Col>
                <Col span="7">
                    <Input v-if="item.type==1||item.type==2" type="text" v-model="item.value" placeholder="请输入关键字"></Input>
                    <Radio-group v-if="item.type==3" v-model="item.value">
                        <Radio v-for="b in getOps(item)" :key="b.id" :label="b.label">{{ b.label }}</Radio>
                    </Radio-group>
                    <Checkbox-group v-if="item.type==4" v-model="item.value">
                        <Checkbox v-for="b in getOps(item)" :key="b.id" :label="b.label">{{ b.label }}</Checkbox>
                    </Checkbox-group>
                    <Select v-if="item.type==5" v-model="item.value">
                        <Option v-for="b in getOps(item)" :key="b.id" :label="b.label">{{ b.label }}</Option>
                    </Select>
                    <Time-picker type="time" v-if="item.type==6" v-model="item.value"></Time-picker>
                    <Date-picker type="date" v-if="item.type==7" v-model="item.value"></Date-picker>
                    <Rate v-if="item.type==8" v-model="item.value"></Rate>
                    <iSwitch v-if="item.type==9" v-model="item.value"></iSwitch>
                </Col>
                <Col span="4">
                    <Button @click="handleSearchRemove(index)" style="margin-left: 33px">移除条件</Button>
                </Col>

            </Row>
         </FormItem>   
        <FormItem>
        <Row>
            <Col>
            <Button type="dashed" long @click="handleSearchAdd" icon="md-add">添加条件</Button>
            </Col>
        </Row>
        </FormItem>
        <FormItem>
        <Row type="flex" justify="center">
            <Col>
            <Button type="primary" @click="search(formDynamic)">查询</Button>
            </Col>
        </Row>
        </FormItem>
    </Form>
</template>
<script>
    export default{
        name:"searcher",
        props:['template','search'],
        data(){
            return{
                fieldKey:"",fieldKeys:[],
                symbolList: [
                                    { value: 'eq', label: '=' }, { value: 'ne', label: '≠' }, { value: 'gt', label: '>' }, { value: 'lt', label: '<' },
                                    { value: 'ge', label: '≧' }, { value: 'le', label: '≦' }
                                ],


                fieldList: [
                    { value: '平台公司名称', label: '平台公司名称' }, { value: '合同台账编号', label: '合同台账编号' },
                    { value: '区域', label: '区域' }, { value: '省', label: '省' }, { value: '市', label: '市' },
                    { value: '区县', label: '县' }, { value: '合同签署主体', label: '合同签署主体' }, { value: '项目执行主体', label: '项目执行主体' },
                    { value: '财务记账主体', label: '财务记账主体' }, { value: '所属项目部', label: '所属项目部' }, { value: '合同类型', label: '合同类型' },
                    { value: '合同年份', label: '合同年份' }, { value: '业务类别', label: '业务类别' }, { value: '业主单位', label: '业主单位' },
                    { value: '合同名称', label: '合同名称' }, { value: '合同编号', label: '合同编号' }, { value: '签订方式', label: '签订方式' },
                    { value: '合同开始日期', label: '合同开始日期' }, { value: '合同结束日期', label: '合同结束日期' }, { value: '作业面积', label: '作业面积' },
                    { value: '合同总金额', label: '合同总金额' }
                ],
                index:1,
                formDynamic: {
                    items: [
                    {
                        value: '',
                        symbol: '',
                        field: '',
                        index: 1,
                        type:0//UI 1 input.....
                    }
                    ]
                },

                templateInfo:[]
            }
        },
        methods:{
            getOps(item){
                // let t=JSON.parse(this.template).find(t=>{if(t.id==item.id)return t})
                // console.log("getOps t:",t)
                return [{id:1,label:"一年级"},{id:2,label:"二年级"},{id:3,label:"三年级"}]
            },
            handleSearchSubmit(){
                console.log("formDynamic:",this.formDynamic)
            },
            selectField(val,item){
                console.log("selectField val:",val)
                let t=JSON.parse(this.template).find(t=>{if(t.id==val)return t})
                if(t && t.t)item.type=t.t
                console.log("selectField t:",t)
            },
            // handleSearchReset () {
            //     this.$refs['formDynamicRef'].resetFields()
            // },
            handleSearchAdd () {
                this.index++
                this.formDynamic.items.push({
                    symbol: '',
                    field: '',
                    value: '',
                    index: this.index
                })
                console.log("after add  this.index:",this.index)
            },
            handleSearchRemove (index) { 
                this.index--
                this.formDynamic.items.splice(index, 1)
                console.log("after remove par index:",index," this.index:",this.index)               
            }
        },mounted(){
            // console.log("mounted template:",this.template)
            // if(!this.template)return
            // //【图片、文件、富文本】不能参与查询
            // this.templateInfo=JSON.parse(this.template).map(t=>{
            //     console.log("t:",t,"if",(t.t!=10 && t.t!=11 && t.t!=12)); 
            //     if(t.t!=10 && t.t!=11 && t.t!=12) {console.log("t2:",t); return t}
            // })

        },created(){
            // console.log("created template:",this.template)
            // if(!this.template)return
            // //【图片、文件、富文本】不能参与查询
            // this.templateInfo=JSON.parse(this.template).map(t=>{
            //     console.log("t:",t,"if",(t.t!=10 && t.t!=11 && t.t!=12)); 
            //     if(t.t!=10 && t.t!=11 && t.t!=12) {console.log("t2:",t); return t}
            // })

        }
    }
</script>