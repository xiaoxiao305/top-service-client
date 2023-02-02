<template>
  <div class="editor">
      <Toolbar :editor="editor" :defaultConfig="config.toolbar" />
      <Editor style="height: 400px; overflow-y: hidden;" :defaultConfig="config.editor" v-model="html" @onChange="onChange" @onCreated="onCreated" />
  </div>
</template>
<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
export default {
  name: "RichEditor",
  components: { Editor, Toolbar },
  data() {
    return {
      editor: null,
      design:true,
      html:"",
      config:{
        toolbar:{
          // toolbarKeys: [ /* 显示哪些菜单，如何排序、分组 */ ],
          // excludeKeys: [ /* 隐藏哪些菜单 */ ],
        },
        editor:{placeholders: '请输入内容...',
          // autoFocus: false,
          // 所有的菜单配置，都要在 MENU_CONF 属性下
          MENU_CONF: {}}
      }
    }
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor)
    },
    onChange(editor) {
      console.log('onChange', editor.getHtml()) // onChange 时获取编辑器最新内容

    },
  },
  mounted() {},
  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy()
  }
}
</script>
<style src="@wangeditor/editor/dist/css/style.css"></style>
<style scoped>
.editor{border: 1px solid #ccc;}
.editor>div:first-child{border-bottom: 1px solid #ccc;}
.editor>div:last-child{background:#f1f1f1;text-align:right;height:20px;line-height: 20px}
.editor>div:last-child i{font-size: 25px}
</style>
