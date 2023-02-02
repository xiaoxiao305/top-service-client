<template>
<div>
    <div v-for="(model,i) in items" :key="i"   @click="checkTag(model)"  class="component"  :style="curModel.id==model.id?'border:1px solid red':''">
      <Icon v-show="curModel.id==model.id" type="md-trash" @click="delTag(model)" color="red" size="20" style="float:right"/>
        <div>
            <b>{{model.name}}</b>
            <Input v-if="model.ui==1" :placeholder="model.placeholder" style="width: auto"/>
            <Input v-if="model.ui==2" :placeholder="model.placeholder" style="width: auto"/>
            <RadioGroup v-if="model.ui==3">
                <Radio v-for="(ra,r) in model.options" :label="ra.label" :key="r">{{ ra.value }}</Radio>
            </RadioGroup>
            <CheckboxGroup v-if="model.ui==4">
                <Checkbox v-for="(ra,r) in model.options" :label="ra.value" :key="r">{{ ra.value }}</Checkbox>
            </CheckboxGroup>
            <Select v-if="model.ui==5">
                <Option v-for="(ra,r) in model.options" :label="ra.value" :key="r">{{ ra.value }}</Option>
            </Select>
            <TimePicker  v-if="model.ui==6"></TimePicker>
            <DatePicker v-if="model.ui==7"></DatePicker>
            <Rate v-if="model.ui==8"></Rate>
            <i-Switch v-if="model.ui==9"></i-Switch>
        </div>
    </div>
</div>
</template>

<script>
export default {
  props: ['items','item'],
  data(){
    return{
        curModel:this.item
    }
  },
  methods:{
    checkTag(model){ 
      this.curModel=model;
      this.$emit('dragWidget',model)
    },
    delTag(model){
      this.items = this.items.filter((m) => {return m.id != model.id;});
      this.curModel={};
    },
  },
}
</script>

<style scoped>
.component{margin-top:8px;border: 1px solid #ccc;border-radius: 3px;padding: 8px 0;}
.component b{height:40px;line-height:40px;padding-left: 8px;padding-right: 8px;}
.component input,select,textarea,option,label{height:40px;line-height: 40px;width: auto;}
</style>

