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
    <p class="display-label">Padding</p>
    <input-dial
      v-model:value="paddingValue"
      style="margin-bottom: 20px"
      @valueChanged="handlePaddingChange"
    ></input-dial>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import { Toolspace } from "../services/toolspace";
import store from "@/store";
import { ToolStates } from "@/services/shared/toolStates";
import ButtonStack from "./ButtonStack.vue";
import InputDial from "./InputDial.vue";

@Options({
  props: {},
  components: { ButtonStack, InputDial },
})
export default class LayoutSection extends Vue {
  displayButtons = [{ id: "", source: "", state: false, placeholder: "" }];
  paddingValue = 0;
  uiUpdate = false

  get display(): any {
    return store.state.data.display;
  }

  get padding(): any {
    return store.state.data.padding;
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

    this.$watch("padding", (value: any, old: any) => {
      if (value) {
        let num = Number.parseFloat(value.replace(/[^\d-.]/g, ""));
        num = Number.parseFloat(num.toFixed(1));

        this.paddingValue = num;
        this.uiUpdate = true;
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
  handlePaddingChange(data: { value: number; unit: string }) {
    Toolspace.getInstance().updateStyle({
      declartion: "padding",
      value: data.value + data.unit,
      precedence: false,
    });
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
  margin-left: 4px;
}
.outline:focus {
  outline-style: none;
  box-shadow: none;
  border-color: initial;
}
</style>

