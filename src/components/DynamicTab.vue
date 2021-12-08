<template>
  <div>
    <div class="icon-buttons-wrapper">
      <icon-button
        id="styleButton"
        @ibclicked="handle"
        :source="source"
      ></icon-button>
    </div>

    <div :class="{ hide: hideStylePane }" class="style-pane-wrapper">
      <!-- <icon-button
        id="displayBlock"
        @ibclicked="handle"
        :source="source"
        :class="{ testing: state }"
      ></icon-button> -->
      <layout-section></layout-section>

    </div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import { Toolspace } from "../services/toolspace";
import { computed } from "vue";
import store from "@/store";
import IconButton from "./IconButton.vue";
import LayoutSection from "./LayoutSection.vue"

@Options({
  props: {},
  components: { IconButton, LayoutSection },
})
export default class DynamicTab extends Vue {
  source!: string;
  hideStylePane = false;
  state = computed({
    get() {
      return store.state.data.display !== undefined;
    },
    set(value: boolean) {},
  });

  beforeMount() {
    this.source = require("../assets/icons/paint.svg");
  }

  handle(e: any) {
    switch (e.id) {
      case "styleButton": {
        if (this.hideStylePane) this.hideStylePane = false;
        else this.hideStylePane = true;
        break;
      }
      case "displayBlock": {
        //Toolspace.getInstance().updateStyle("");
      }
    }
  }
}
</script>

<style scoped>
.style-pane-wrapper {
  background: rgba(255, 255, 255, 0.034);
  border-radius: 0px 4px;
  height: calc(100vh - 50px);
  padding: 10px;
}
.hide {
  display: none;
}
.testing {
  border: solid;
  border-color: white;
  border-width: 1px;
}
</style>

