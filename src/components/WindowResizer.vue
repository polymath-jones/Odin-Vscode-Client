<template>
  <div
    :style="`max-width: ${maxWidth}px; min-width: ${currentWidth}px`"
    ref="resizer"
    class="resizer-container"
    :class="{ highlight: mouseDown, limited: reachedLimit }"
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
import { Options, Vue } from "vue-class-component";
import store from "@/store";
import ResizeObserver from "resize-observer-polyfill";

@Options({
  props: {},
  components: {},
})
export default class WindowResizer extends Vue {
  hovering = false;
  mouseDown = false;
  startX = 0;
  currentWidth = 0;
  reachedLimit = false;

  get maxWidth(): any {
    const max = store.state.viewData.windowConstriants.max;
    return max > this.containerWidth ? this.containerWidth : max;
  }

  get minWidth(): any {
     const min = store.state.viewData.windowConstriants.min;
    return min > this.containerWidth ? this.containerWidth : min;
  }

  get containerWidth(): any {
    return store.state.viewData.windowContainerSize;
  }

  get handle(): string {
    return this.hovering || this.mouseDown
      ? require("../assets/icons/handleGreen.svg")
      : require("../assets/icons/handle.svg");
  }
  handleMouseUp = (ev: MouseEvent) => {
    if (this.mouseDown) this.mouseDown = false;
    if (this.currentWidth > this.maxWidth) this.currentWidth = this.maxWidth;
    if (this.currentWidth < this.minWidth) this.currentWidth = this.minWidth;
    this.reachedLimit = false;
  };
  handleMouseMove = (ev: MouseEvent) => {
    if (this.mouseDown) {
      const delta = this.startX - ev.clientX;
      this.startX = ev.clientX;
      if (
        !(this.currentWidth > this.maxWidth) &&
        this.currentWidth >= this.minWidth
      )
        this.currentWidth -= delta * 2;
      else {
        this.reachedLimit = true;
        if (delta < 0 && this.currentWidth < this.minWidth) {
          this.currentWidth -= delta * 2;
          this.reachedLimit = false;
        } else if (delta > 0 && this.currentWidth >= this.maxWidth) {
          this.currentWidth -= delta * 2;
          this.reachedLimit = false;
        }
      }
    }
  };

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
    var parent = document.querySelector("#workspace-container")!;
    const observer = new ResizeObserver(
      (entries: Array<ResizeObserverEntry>) => {
        const width = entries[0].contentRect.width;
        store.commit("setWindowConstraints", {
          min: 1200,
          max: width,
        });

        store.commit("setContainerSize", width);
        if (this.currentWidth > width) this.currentWidth = width;
      }
    );
    observer.observe(parent);
    this.currentWidth = parent.clientWidth;

    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);

    this.$watch("maxWidth", (value: number, old: number) => {
        this.currentWidth = value;
    });
  }
}
</script>

<style scoped>
.resizer-container {
  transition: 0.2s ease-in-out;
  box-sizing: border-box;
  position: relative;
  margin: auto;
  display: flex;
  height: 100%;
  border-radius: 10px;
}
.resizer-handle {
  background-color: #262729;
  display: flex;
  align-items: center;
  border-radius: 0px 10px 10px 0px;
}
.resizer-screen {
  cursor: w-resize;
  position: fixed;
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
  width: 13px;
  top: 0px;
}
.limited {
  outline: #d8d665 solid 1px !important;
}
.disable {
  pointer-events: none;
}
.highlight {
  transition-duration: 0s;
  outline: #6fcf97 solid 1px;
}
</style>
