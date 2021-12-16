<template>
  <div
    :style="`max-width: ${maxWidth}px; min-width: ${currentWidth}px`"
    ref="resizer"
    class="resizer-container"
    :class="{ highlight: mouseDown }"
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
import store from "@/store";
import ResizeObserver from "resize-observer-polyfill";

@Options({
  props: {},
  components: {},
})
export default class WindowResizer extends Vue {
  //   handle = require("../assets/icons/handle.svg");
  hovering = false;
  mouseDown = false;
  startX = 0;
  currentWidth = 0;

  get maxWidth(): any {
    return store.state.viewData.windowConstriants.max; //== 0 ? 100 : value;
  }
  get handle(): string {
    return this.hovering || this.mouseDown
      ? require("../assets/icons/handleGreen.svg")
      : require("../assets/icons/handle.svg");
  }
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
    var parent = document.querySelector("#workspace-container")!
    const observer = new ResizeObserver(
      (entries: Array<ResizeObserverEntry>) => {
        const width = entries[0].contentRect.width;
        store.commit("setWindowConstraints", {
          min: 200,
          max: width,
        });
        if (this.currentWidth > width) this.currentWidth = width;
      }
    );
    observer.observe(parent);
    this.currentWidth = parent.clientWidth
    

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
.highlight {
  outline: #6fcf97 solid 1px;
}
</style>
