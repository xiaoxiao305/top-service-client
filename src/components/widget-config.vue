<template>
  <div v-show="show">
    <Form label-position="top" style="padding-left:8px">
      <FormItem label="标题">
        <Input  v-model="data.name"></Input >
      </FormItem>
     <FormItem label="占位符" v-if="data.hasOwnProperty('placeholder')">
        <Input  v-model="data.placeholder"></Input >
      </FormItem>
      <FormItem label="默认值" v-if="data.hasOwnProperty('defaultValue')">
        <Input  v-model="data.defaultValue"></Input >
      </FormItem>
     <FormItem label="选项" v-if="data.hasOwnProperty('options')">
        <template>
          <template v-if="data.type=='radio' ||data.type=='checkbox'|| data.type=='select'">
            <RadioGroup>
              <draggable tag="ul" :list="data.options"
                v-bind="{group:{ name:'options'}, ghostClass: 'ghost',handle: '.drag-item'}"
                handle=".drag-item"
              >
                <li v-for="(item, index) in data.options" :key="index" >
                  <Radio
                    label="item.value"
                    style="margin-right: 5px;"
                  >
                    <Input   style="width:90px;"  v-model="item.value"></Input >
                  </Radio >
                  <i class="drag-item" style="font-size: 16px;margin: 0 5px;cursor: move;"><i class="iconfont icon-icon_bars"></i></i>
                  <Button icon="md-remove"  @click="handleOptionsRemove(index)" circle plain  style="padding: 4px;margin-left: 5px;" ></Button>
                </li>
              </draggable>
            </RadioGroup>
          </template>
          <div style="margin-left:22px;">
            <b @click="handleAddOption" style="color:dodgerblue;cursor: pointer;">添加选项</b>
          </div>
        </template>
      </FormItem>
      <template v-if="data.type == 'time' || data.type == 'date'">
        <FormItem label="是否为范围选择">
          <i-Switch  v-model="data.isRange" />
        </FormItem>
      </template> 
      <!-- <FormItem label="默认值" v-if="Object.keys(data.options).indexOf('defaultValue')>=0 && data.type !='time' && data.type !='date'">
        <Rate v-if="data.type=='rate'" :allow-half="data.allowHalf" v-model="data.defaultValue" />
        <i-Switch v-if="data.type=='switch'" v-model="data.defaultValue" ></i-Switch>
      </FormItem> -->
<!--
      <template v-if="data.type=='imgupload'">
        <FormItem label="limit">
          <Input  type="number" v-model.number="data.length"></Input >
        </FormItem>
        <template>
          <FormItem label="imageAction" :required="true">
            <Input  v-model="data.action"></Input >
          </FormItem>
        </template>
      </template>   -->
      <!-- <FormItem label="remoteData" v-if="data.type=='cascader'">
        <div>
          <Input v-model="data.remoteFunc">
            <template slot="prepend">远端方法</template>
          </Input >
          <Input v-model="data.props.value">
            <template slot="prepend">值</template>
          </Input >
          <Input v-model="data.props.label">
            <template slot="prepend">标签</template>
          </Input >
          <Input v-model="data.props.children">
            <template slot="prepend">子选项</template>
          </Input >
        </div>
      </FormItem> -->

    </Form>
  </div>
</template>
<script>
export default {
  props: ['data'],
  created() {
    //接收到组件widget-form.vue选中的元素类型，改变相应的属性
    this.$off("chWidgetConfig")
    this.$on("chWidgetConfig", ({model}) => {
      this.data=model;
    });

  },
  computed: {
    show () {
      if (this.data && this.data.id>0) {
        return true
      }
      return false
    }
  },
  methods: {
    handleOptionsRemove (index) {
        this.data.options.splice(index, 1)
    },
    handleAddOption () {
        this.data.options.push({
          value: this.newOption
        }) 
    },
  },
  watch: {
    'data.isRange': function(val) {
      if (typeof val !== 'undefined') {
        if (val) {
          this.data.defaultValue = null
        } else {
          if (Object.keys(this.data).indexOf('defaultValue')>=0)
            this.data.defaultValue = ''
        }
      }
    },
  },
}
</script>
