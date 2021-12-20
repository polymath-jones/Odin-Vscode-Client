<template>
  <div>
    <p class="display-label">Display</p>
    <button-stack
      :styled="true"
      fill="#4D4C51"
      v-model:buttons="displayButtons"
      :optimize="true"
      :wide="true"
      @changed="handleDisplayChange"
    ></button-stack>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import { Toolspace } from "../services/toolspace";
import store from "@/store";
import { ToolStates } from "@/services/shared/toolStates";
import ButtonStack from "./ButtonStack.vue";

@Options({
  props: {},
  components: { ButtonStack },
})
export default class LayoutSection extends Vue {

  displayButtons = [{ id: "", source: "", state: false, placeholder: "" }];
  get display(): any {
    return store.state.data.display;
  }

  beforeMount() {
    this.displayButtons = ToolStates.getInstance().displayButtons;
  }
  mounted() {
    this.$watch("display", (value: any, old: any) => {
      for (let i = 0; i < this.displayButtons.length; i++) {
        this.displayButtons[i].state = value == this.displayButtons[i].id;
      }
    });
  }

  toggleButtonStates(states: Array<any>, index: number) {
    for (let i = 0; i < states.length; i++) {
      if (i == index) {
        if (!states[index].state) {
          states[index].state = true;
        }
      } else {
        states[i].state = false;
      }
    }
  }

  handleDisplayChange(index: number) {
    let btn = this.displayButtons[index];
    Toolspace.getInstance().updateStyle({
      declartion: "display",
      value: btn.id,
      precedence: false,
    });
  }
}
</script>

<style scoped>
.display-label {
  margin-top: 16px;
  color: #ffffff;
  font-size: 12px;
  margin-left:4px;
}
.outline:focus {
  outline-style: none;
  box-shadow: none;
  border-color: initial;
}
</style>

