<template>
  <!-- 无限极下拉框 -->
  <Dropdown-menu>
    <template v-for="org in parent">
        <Dropdown v-if="org.children && org.children.length > 0"  :key="org.id" :placement="placement">
            <Dropdown-item :name="org.tid">
                {{org.name}}
                <Icon :type="icon"></Icon>
            </Dropdown-item>
            <drop-down-item slot="list" :parent="org.children" :placement="placement" :icon="icon"></drop-down-item>
        </Dropdown>
        <Dropdown-item v-else :name="org.tid" :key="org.id">
            {{org.name}}
        </Dropdown-item>
    </template>
  </Dropdown-menu> 
</template>
<script>
import dropDownItem from '../components/drop-down-item'
export default {
  name: 'drop-down-item',
  components: {dropDownItem},
  props: ['parent','placement','icon'],
}
</script>