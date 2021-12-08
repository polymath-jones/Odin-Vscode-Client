<template>
  <drawer>
    <layout class="align"></layout>
  </drawer>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import Drawer from "./Drawer.vue";
import Layout from "./Layout.vue";

@Options({
  props: {},
  components: { Drawer, Layout },
})
export default class LayoutSection extends Vue {}
</script>

<style scoped>
.align{
  padding:  20px 0;
  text-align: left;
}
</style>

