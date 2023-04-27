<template>
  
<div>
  <div>
    input-单：<input type="file" accept="image/png,image/jpeg,image/gif,image/jpg" ref="icon1"/>
    <Button icon="md-cloud-upload" size="small" class="ico-upload" @click="fileTest1">上传</Button>
  </div>
  <div>
    input-多：<input type="file" accept="image/png,image/jpeg,image/gif,image/jpg" ref="icon2" multiple />
    <Button icon="md-cloud-upload" size="small" class="ico-upload" @click="fileTest2">上传</Button>
  </div> 
  upload-单:
  <Upload
      :before-upload="handleUpload"
      action="">
      <Button icon="ios-cloud-upload-outline">选择图片</Button>
  </Upload>
  <Button type="text" @click="upload1">上传</Button><br/>
  upload-多:
  <Upload multiple
      :before-upload="handleUpload2"
      action="">
      <Button icon="ios-cloud-upload-outline">选择图片</Button>
  </Upload>
  <Button type="text" @click="upload2">上传</Button>
</div>


</template>
<script>
import ajax from "../logic/ajax"
export default {
  name: "test", 
  data(){
    return { 
      files1:[], 
      files2:[],
    }
  },
  methods:{
    handleUpload (file) {
      // this.file1 = file;
      this.files1.push(file)
      return false;
    },  
    handleUpload2 (file) {
      console.log(file)
      // this.file2 = file;
      this.files2.push(file)
      return false;
    },
    fileTest1(){
      let data={"B":this.$refs.icon1.files}
      console.log("fileTest1:",data)
      ajax.Upload(88,data,0).then((res)=>{
        console.log("fileTest1 ajax res: ",res)
      })
    }, 
    fileTest2(){
      let data={"B":this.$refs.icon2.files}
      console.log("fileTest2:",data)
      ajax.Upload(88,data,0).then((res)=>{
        console.log("fileTest2 ajax res: ",res)
      })
    }, 
    upload1(){
      let data={"B":this.files1}
      console.log("upload1:",data," files1:",this.files1)
      let forms=[{id:'A',type:1,value:''},{id:'B',type:2,value:''}]
      ajax.Upload(88,data,0).then((res)=>{
        console.log("upload1 ajax res: ",res)
        Object.keys(res.fields).forEach(k=>{
          forms.forEach(f=>{
            if(f.id==k)f.value=res.fields[k]
          })
        })
        console.log("forms:",forms) 
      })
    }, 
    upload2(){ 
      let data={"B":this.files2}
      console.log("upload2:",data," files2:",this.files2)
      ajax.Upload(88,data,0).then((res)=>{
        console.log("upload2 ajax res: ",res)
        Object.keys(res.fields).forEach(k=>{
          forms.forEach(f=>{
            if(f.id==k)f.value=res.fields[k]
          })
        })
        console.log("forms:",forms) 
      })
    },
    upload(data){
      let req = new XMLHttpRequest();
      req.responseType = 'text';
      let formData = new FormData()
      formData.append("uid","1")
      formData.append("token", "user.token")
      formData.append("tid", "1")
      formData.append("type", "0") //0:模板,1:员工,2:流程
      Object.keys(data).forEach(name => {
        let files=data[name]
          for (let i=0;i<files.length;i++){
            formData.append(name, files[i],files[i].name)
          }
      })
      req.onload = (e) => {
        console.log("uploadTest:",e)
        let rsp = JSON.parse(e.target.response)
      }
      req.open("POST","http://test.itsmtop.com/upload")
      req.send(formData)
    }
  }
}
</script>

<style scoped>

</style>
