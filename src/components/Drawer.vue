<template>
  <div>
    <div></div>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {},
  components: {},
})
export default class Drawer extends Vue {}
</script>

<style scoped>
</style>

