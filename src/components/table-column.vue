<template>
  <div>
      <Dropdown transfer >
          <span style="cursor:pointer">
              {{content}}
              <Icon type="ios-funnel" size="20" />
          </span>
          <DropdownMenu slot="list">
              <Checkbox v-model="checkAll" :indeterminate="indeterminate" @on-change="selectAll" style="display:block;padding-left:8px;height:50px;line-height: 50px;">全选</Checkbox>
              <CheckboxGroup v-model="realList"
                 @on-change="handleCheckedChange">
                 <Checkbox  v-for="item in data"
                 :key="item.key" :label="item.key" style="display:block;padding-left:8px;height:30px;line-height: 30px;">{{ item.title }}</Checkbox>
               </CheckboxGroup>
          </DropdownMenu>
      </Dropdown>
  </div>
  </template>
  <script>
  export default {
      data(){
        return {
          checkAll: false,realList: [],indeterminate:true
      }},
      //标题、所有字段名、已选中字段名
      props:['content','data','checkList'],
      watch: {
        checkList(val) {
          if(!val)return
          this.realList = val
          if (val.length === this.data.length) {
            this.indeterminate = false
            this.checkAll = true
          }
        }
      },
      methods:{
        // checkbox选中事件
        handleCheckedChange(value) {
          let checkedCount = value.length
          this.checkAll = (checkedCount === this.data.length)
          this.indeterminate = checkedCount > 0 && checkedCount < this.data.length
          this.$emit('handChange',value)
        }, 
        // 全选按钮
        selectAll(val) {
          this.realList = val ? this.data.map(item => item.key) :[]
          if (val)
            this.indeterminate = false
          else
            this.indeterminate = true
          this.$emit('handChange',this.realList)
        },
      },
      created(){
        if(this.checkList.length<1)return
        this.realList=[...this.checkList]
        if (this.realList.length === this.data.length) {
            this.indeterminate = false
            this.checkAll = true
        }
      }
  }
  </script>