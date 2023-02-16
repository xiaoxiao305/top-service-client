<template>
    <Form ref="formDynamic" :model="formDynamic">{{ JSON.parse(template) }}
         <!-- <FormItem v-for="(item, index) in JSON.parse(template)" :key="item.id" :label="'条件'+item.id+':'">
            {{ item }}:{{ index }} -->
           <Select placeholder="请选择查询字段">
                <Option v-for="i in JSON.parse(template)" :value="i.id" :key="i.id">{{ i.n }}</Option>
            </Select>

        <!-- </FormItem>  -->
        <FormItem
        v-for="(item, index) in formDynamic.items"
        :key="index"
        :label="'条件' + item.index + '：'"
        :prop="'items.' + index + '.value'"
        >
        <!-- <Row :gutter="3">
            <Col span="7">
                <Select v-model="item.field" placeholder="请选择查询字段" clearable>
                <Option v-for="i in fieldList" :value="i.value" :key="i.value">{{ i.label }}</Option>
            </Select>
            </Col>
            <Col span="3">
            <Select v-model="item.symbol" placeholder="条件" clearable>
                <Option v-for="i in symbolList" :value="i.value" :key="i.value">{{ i.label }}</Option>
            </Select>
            </Col>
            <Col span="7">
            <Input type="text" v-if="item.inputVisible" v-model="item.value" placeholder="请输入关键字"></Input>
            <Cascader v-if="item.cascadeVisible" transfer :data="orgSels" placeholder="请选择关键字"
                        :render-format="(label,selectData)=>{return label[label.length-1];}"
                        @on-change="(value) => {item.value = '';item.value = value[value.length - 1];}">
            </Cascader>
            <Select v-if="item.selectVisible" v-model="item.value" transfer clearable placeholder="请选择关键字">
                <Option v-for="item in searchList" :value="item.value" :key="item.value">
                {{ item.label }}
                </Option>
            </Select>
            <Select v-if="item.selectDictVisible" v-model="item.value" transfer clearable placeholder="请选择关键字">
                <Option v-for="item in dictList" :value="item.dictValue" :key="item.dictValue">
                {{ item.dictLable }}
                </Option>
            </Select>
            <Cascader v-if="item.provincesCascadeVisible" :data="areaData" @on-change="(value) => {item.value = '';item.value = value.toString()}" transfer placeholder="请选择省市区"></Cascader>
            </Col>
            <Col span="4">
            <Button @click="handleSearchRemove(index)" style="margin-left: 33px">移除条件</Button>
            </Col>
        </Row> -->
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
            <!-- <Button type="primary" @click="handleSearchSubmit">查询</Button>
            <Button style="margin-left: 8px" @click="handleSearchReset">重置</Button> -->
            </Col>
        </Row>
        </FormItem>
        <Row type="flex" justify="end">
        <Col>
            <p style="color: red">注：日期格式为：yyyy-MM-dd，如2021-10-01</p>
        </Col>
        </Row>
    </Form>
</template>
<script>
    export default{
        name:"searcher",
        props:['template'],
        data(){
            return{
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
                symbolList: [
                    { value: 'eq', label: '=' }, { value: 'ne', label: '≠' }, { value: 'gt', label: '>' }, { value: 'lt', label: '<' },
                    { value: 'ge', label: '≧' }, { value: 'le', label: '≦' }
                ],
                formDynamic: {
                    items: [
                    {
                        value: '',
                        symbol: 'eq',
                        field: '平台公司名称',
                        index: 1,
                        provincesCascadeVisible: false,
                        selectDictVisible: false,
                        cascadeVisible: false,
                        inputVisible: true,
                        selectVisible: false
                    }
                    ]
                },

            }
        },methods:{
            handleSearchReset () {
                this.$refs['formDynamicRef'].resetFields()
            },
            handleSearchAdd () {
                this.index++
                this.formDynamic.items.push({
                    symbol: '',
                    field: '',
                    value: '',
                    index: this.index
                })
            },
            handleSearchRemove (index) {
                this.index--
                this.formDynamic.items.splice(index, 1)
            },

        }
    }
</script>