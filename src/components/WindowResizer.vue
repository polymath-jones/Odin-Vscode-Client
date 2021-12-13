<template>
  <div
    :style="`max-width: ${maxWidth}px;min-width: ${currentWidth}px`"
    ref="resizer"
    class="resizer-container"
    :class="{highlight: hovering}"
  >
    <slot></slot>
    <div class="resizer-handle">
      <img
        @mouseenter="highlightBar"
        @dragstart="handleDragStart"
        @mousedown="handleMouseDown"
        @mouseleave="removeHighlight"
        class="handle-image"
        :src="handle"
        alt=""
      />
    </div>
    <div class="resizer-screen" :class="{ disable: !mouseDown }"></div>
  </div>
</template>

<script lang ="ts">
import { Workspace } from "@/services/workspace";
import { Options, Vue } from "vue-class-component";
@Options({
  props: {},
  components: {},
})
export default class WindowResizer extends Vue {
  //   handle = require("../assets/icons/handle.svg");
  hovering = false;
  mouseDown = false;
  startX = 0;
  maxWidth = 0;
  currentWidth = 0;

  handleMouseUp = (ev: MouseEvent) => {
    if (this.mouseDown) this.mouseDown = false;
    if (this.currentWidth > this.maxWidth) this.currentWidth = this.maxWidth;
  };
  handleMouseMove = (ev: MouseEvent) => {
    if (this.mouseDown) {
      const delta = this.startX - ev.clientX;
      this.startX = ev.clientX;
      if (!(this.currentWidth > this.maxWidth)) this.currentWidth -= delta * 2;
    }
  };
  get handle(): string {
    return (this.hovering || this.mouseDown)
      ? require("../assets/icons/handleGreen.svg")
      : require("../assets/icons/handle.svg");
  }
  highlightBar() {
    if (!this.hovering) this.hovering = true;
  }
  removeHighlight() {
    if (this.hovering) this.hovering = false;
  }
  handleDragStart(e: Event) {
    e.stopPropagation();
    e.preventDefault();
  }
  handleMouseDown(e: MouseEvent) {
    if (!this.mouseDown) {
      this.mouseDown = true;
      this.startX = e.clientX;
    }
  }
  mounted() {
    const elt = this.$refs.resizer as HTMLElement;
    const rect = elt.parentElement!.getBoundingClientRect();
    this.maxWidth = rect.width;
    this.currentWidth = rect.width;

    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  }
}
</script>

<style scoped>
.resizer-container {
box-sizing: border-box;
  position: relative;
  margin: auto;
  display: flex;
  height: 100%;
  background-color: #313133;
  border-radius: 10px;
}
.resizer-handle {
  display: flex;
  align-items: center;
  border-radius: 0px 10px 0px 0px;
}
.resizer-screen {
  position: absolute;
  top: 0px;
  left: 0px;
  width: calc(100% - 12px);
  height: 100%;
}
.handle-image {
  user-select: none;
  cursor: w-resize;
  transform: translateY(-50%);
  position: relative;
  top: 0px;
}
.disable {
  pointer-events: none;
}
.highlight{
    /* border: 2px solid #6FCF97; */
}
</style>
