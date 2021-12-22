

<template>
  <div
    class="toggle-container"
    :class="{
      noStyle: !styled,
      vertical: vertical,
      pilled: pilled,
      outlined: outlined,
      wide: wide,
    }"
  >
    <stack-button
      class="stack-button"
      :class="{ noMargin: styled, spread: spread }"
      v-for="(button, idx) in buttons"
      :key="idx"
      :imageSource="button.source"
      :placeholder="button.placeholder"
      :pressedState="button.state"
      :id="button.id"
      :fill="fill"
      :compact="!styled"
      :compressed="optimize"
      :pilled="pilled"
      :highlighted="styled"
      @click="handleClick(idx)"
    >
    </stack-button>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import StackButton from "./StackButton.vue";

@Options({
  props: {
    buttons: Array,
    vertical: Boolean,
    outlined: Boolean,
    pilled: Boolean,
    styled: Boolean,
    fill: String,
    wide: Boolean,
    spread: Boolean,
    optimize: Boolean
  },
  components: { StackButton },
})
export default class ButtonStack extends Vue {
  
  state!: any;
  get buttons(): any {
    return (this.$props as any).buttons;
  }

  beforeMount() {
    this.state = this.buttons;
  }

  handleClick(idx: number) {
    for (let i = 0; i < this.state.length; i++) {
      if (i == idx) {
        if (!this.state[idx].state) {
          this.state[idx].state = true;
          this.$emit("update:buttons", this.state);
          this.$emit("changed", idx)
        }
      } else {
        this.state[i].state = false;
      }
    }
  }
}
</script>

<style scoped>
.toggle-container {
  width: fit-content;
  margin: 0;
  user-select: none;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  padding: 3.6px;
  background-color: #1e1e1e;
}
.wide {
  width: 100%;
}
.vertical {
  display: block;
}
.stack-button {
  margin: auto;
}
.pilled {
  border-radius: 100px;
}
.outlined {
  border: 1.7px solid #4d4c51;
}
.noStyle {
  background-color: transparent;
}
.noMargin {
  margin: 0px;
}
.spread {
  margin: 0px 8px;
}

.vertical > .spread {
  margin: 20px 0px;
}
</style>
