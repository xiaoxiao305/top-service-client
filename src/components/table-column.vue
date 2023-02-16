<template>
    <div> 
        <Checkbox v-model="checkAll" :indeterminate="indeterminate" @on-change="selectAll">全选</Checkbox><br/><br/>
        <Checkbox-group v-model="realList" class="check-list" @on-change="handleCheckedChange">
            <Checkbox v-for="item in dataArr" :key="item.key" :label="item.key" style="display: block;">{{ item.title }}</Checkbox>
        </Checkbox-group><br/><br/>
        <div class="footer" style="min-width: 200px">
            <Button type="primary" size="small" :disabled="realList.length < 1" @click="()=>{confirm(realList);closeSetting()}">确定</Button>
            <Button size="small" @click="reset">重置</Button>
        </div> 
    </div>  
  </template>
  <script>
  export default {
    name: 'tableColumn',
    props:['dataArr','checkList','defaultArr','confirm','closeSetting'],
    data() {
      return {
        checkAll: false,
        realList: [],indeterminate:false
      }
    },
    watch: {
      checkList(val) {
        this.realList = val
        if (val.length === this.dataArr.length) {
          this.indeterminate = false
          this.checkAll = true
        }
      }
    },
    methods: {
    // 全选按钮
      selectAll(val) {
        this.realList = val ? this.dataArr.map(item => item.key) :[]
        if (val) {
          this.indeterminate = false
        } else {
          this.indeterminate = true
        }
      },
      // checkbox选中事件
      handleCheckedChange(value) {
        let checkedCount = value.length
        this.checkAll = checkedCount === this.dataArr.length
        this.indeterminate = checkedCount > 0 && checkedCount < this.dataArr.length
      }, 
      // 点击重置
      reset() {
        this.realList = [...this.defaultArr]
        this.indeterminate = true;
        this.checkAll = false
      },
    },
    created(){
        if(this.checkList.length>0)
            this.realList=[...this.checkList]
    }
  }
  </script>
  