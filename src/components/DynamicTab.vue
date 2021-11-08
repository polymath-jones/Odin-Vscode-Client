<template>
  <div>
    <div class="icon-buttons-wrapper">
      <icon-button
        id="styleButton"
        @ibclicked="handle"
        :source="source"
      ></icon-button>
    </div>

    <div :class="{ hide: hideStylePane }" class="style-pane-wrapper"></div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import IconButton from "./IconButton.vue";

@Options({
  props: {},
  components: { IconButton },
})
export default class DynamicTab extends Vue {
  source!: string;
  hideStylePane = true;
  beforeMount() {
    this.source = require("../assets/icons/paint.svg");
  }
  handle(e: any) {
    console.log("clicked", e.id);
    if (this.hideStylePane) this.hideStylePane = false;
    else this.hideStylePane = true;
  }
}
</script>

<style scoped>
.style-pane-wrapper {
  background: rgba(255, 255, 255, 0.096);
  border-radius: 0px 4px;
  height: calc(100vh - 50px);
}
.hide {
  display: none;
}
</style>

