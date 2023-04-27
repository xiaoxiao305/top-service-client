<template>
<div class="component">
    <Input v-if="model.type==1" :placeholder="model.placeholder" style="width: auto" v-model="model.value"/>
    <Input v-if="model.type==2" :placeholder="model.placeholder" style="width: auto" v-model="model.value"/>
    <RadioGroup v-if="model.type==3" v-model="model.value">
        <Radio v-for="(ra,r) in model.options" :label="ra.label" :value="ra.value" :key="r.value">{{ ra.label }}</Radio>
    </RadioGroup>
    <CheckboxGroup v-if="model.type==4" v-model="model.value">
        <Checkbox v-for="(ra,r) in model.options" :label="ra.value" :key="r">{{ ra.label }}</Checkbox>
    </CheckboxGroup>
    <Select v-if="model.type==5" v-model="model.value">
        <Option v-for="(ra,r) in model.options" :value="ra.value" :key="r">{{ ra.label }}</Option>
    </Select>
    <TimePicker  v-if="model.type==6" :type="model.range?'timerange':'time'" 
        :placeholder="model.placeholder" v-model="model.value"></TimePicker>
    <DatePicker v-if="model.type==7" :type="model.range?'daterange':'date'"
        :placeholder="model.placeholder" v-model="model.value"></DatePicker> 
    <Rate v-if="model.type==8" v-model="model.value"></Rate>
    <i-Switch v-if="model.type==9" v-model="model.value"></i-Switch> 
    <Upload v-if="model.type==10" accept="image/*" 
    :before-upload="(v)=>handleUpload(model,v)" action=""
    :multiple="model.multi==0?false:model.multi">
        <Icon type="ios-image" size="60" />
     </Upload>
    <Upload v-if="model.type==11" type="drag"  action=""
        :before-upload="(v)=>handleUpload(model,v)"
        :multiple="model.multi==0?false:model.multi">
        <div style="padding: 20px 0">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p>点击或将文件拖拽到这里上传</p>
        </div>
    </Upload>
    <rich-editor v-if="model.type==12" :onChange="rOnChange"></rich-editor>
    <label v-if="model.type==13">{{ model.value }}</label>
</div>
</template>
<script>
import RichEditor from './rich-editor.vue'
export default {
    name:'widget',
    props:['model','handleUpload'],
    components:{RichEditor},
    methods:{
        rOnChange(editor){
            this.model.value=editor.getHtml()
        },
        handleUpload1(file){
            this.handleUpload(this.model,file)
        }
    }
}
</script>
<style scoped>
.component input,select,textarea,option,label{height:40px;line-height: 40px;width: auto;}
</style>
    
    