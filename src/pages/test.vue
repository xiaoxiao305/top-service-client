<template>
 <div>

 </div>
</template>

<script>
import Organization from "../components/organization";

export default {
  name: "test",
  components: {Organization},
  methods:{
    getDiff(){
      //差集 数组arr1相对于arr2所没有的
      let arr1=[1,2,3,4]
      let arr2=[1,4]
      let diff=arr1.filter(item=>arr2.indexOf(item)==-1);
      console.log("差集",diff);
    }, 
    getAtomicIds(index,type,forms){
      let list=[],used=[],noUsed=[]
      if(type==2 || type==12){
        for(let i=0;i<(type==2?6:type==12?8:0);i++){
          list.push((((type==2?'DM':type==12?'DS':'')).toDecimal()+i).toNumber52())
        }
        used=Array.from(forms.filter(f => f.type==type),({id})=>id);
      }else{
        for(let i=0;i<index.toDecimal()+1;i++){
          list.push(i.toNumber52())
        }
        used = Array.from(forms,({id})=>id);
      } 
      //差集 数组list相对于used所没有的
      noUsed=list.filter(item=>used.indexOf(item)==-1);
      console.log("差集",noUsed); 
    }  
  },
  created(){
    let forms=[{id:'A'},{id:'D'},{id:'N'},
    {id:'DN',type:2},{id:'DO',type:2},
    {id:'DT',type:12},{id:'DU',type:12}]
    this.getAtomicIds('O','',forms)
    this.getAtomicIds('',2,forms)
    this.getAtomicIds('',12,forms)
    
  }
}
</script>

<style scoped>

</style>
