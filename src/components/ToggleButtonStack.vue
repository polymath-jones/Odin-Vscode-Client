/* 
 can accept button data: id,placeholder,source
 emits toggled event
 variants are horizontal, vertical, outlined style, pilled , no style, default 
 buttons are toggle type
 
 */

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
      :class="{noMargin: styled, spread: spread}"
      v-for="(button, idx) in buttons"
      :key="idx"
      :imageSource="button.source"
      :placeholder="button.placeholder"
      :pressedState="states[idx]"
      :id="button.id"
      :fill="fill"
      :compact="!styled"
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
    default: Number,
    wide: Boolean,
    spread: Boolean
  },
  components: { StackButton },
})
export default class ToggleButtonStack extends Vue {
  states = new Array<boolean>();
  beforeMount() {
    const buttons = (this.$props as any).buttons as Array<any>;
    const defaultButton = (this.$props as any).default as number;
    for (let i = 0; i < buttons.length; i++) {
      if (i !== defaultButton) this.states.push(false);
      else this.states.push(true);
    }
  }
  handleClick(idx: number) {
    for (let i = 0; i < this.states.length; i++) {
      if (i == idx) {
        if (!this.states[idx]) {
          //todo emit event
          this.states[idx] = true;
        }
      } else {
        this.states[i] = false;
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
.stack-button{
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
.noMargin{
  margin: 0px;
}
.spread{
  margin: 0px 8px
}

.vertical >.spread {
  margin: 20px 0px
}
</style>
