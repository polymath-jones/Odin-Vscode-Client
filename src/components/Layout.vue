<template>
  <div>
    <p>Layout</p>
    <b-button-group size="sm">
      <b-button
        v-for="(btn, idx) in buttons"
        :key="idx"
        :pressed="btn.state"
        :variant="btn.variant"
        :class="{ outline: !btn.state }"
        @click="handle({ state: btn.state, key: idx })"
      >
        {{ btn.caption }}
      </b-button>
    </b-button-group>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import { Toolspace } from "../services/toolspace";
import store from "@/store";

@Options({
  props: {},
  components: {},
})
export default class Layout extends Vue {
  buttons = [
    { caption: "block", state: false, variant: "outline-primary" },
    { caption: "inline", state: false, variant: "outline-secondary" },
    { caption: "inline-block", state: false, variant: "outline-success" },
  ];

  get display(): any {
    return store.state.data.display;
  }
  mounted() {
    this.$watch("display", (value: any, old: any) => {
      for (let i = 0; i < this.buttons.length; i++) {
        this.buttons[i].state = value == this.buttons[i].caption;
      }
      console.log(value);
    });
  }

  handle(data: any) {
    let btn = this.buttons[data.key];
    if (!btn.state) {
      Toolspace.getInstance().updateStyle({
        declartion: "display",
        value: btn.caption,
        precedence: false,
      });
      btn.state = true;
    }

    for (let i = 0; i < this.buttons.length; i++) {
      if (i !== data.key) {
        this.buttons[i].state = false;
      }
    }
  }
}
</script>

<style scoped>
p {
  color: rgba(255, 255, 255, 0.349);
  font-family: sans-serif;
  font-size: 16px;
}
.outline:focus {
  outline-style: none;
  box-shadow: none;
  border-color: initial;
}
</style>

