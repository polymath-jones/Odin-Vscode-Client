<template>
  <div class="drawer-container" ref="select">
    <div @click="handleClick" class="drawer-bar">
      <div class="button-section">
        <tool-button
          class="tool-button"
          :compact="true"
          :imageSource="arrowIcon"
          :class="{ rotate: collapsed }"
        >
        </tool-button>
      </div>
      <div class="input-container">
        <p class="drawer-placeholder">
          {{ placeholder }}
        </p>
      </div>
    </div>
    <div :class="{ collapsed: collapsed }" class="select-content custom-scroll">
      <div style="padding: 12px" class="select-wrapper">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import ToolButton from "./ToolButton.vue";
import Scrollbar from "smooth-scrollbar";

@Options({
  props: {
    pilled: Boolean,
    outlined: Boolean,
    wide: Boolean,
    placeholder: String,
  },
  components: { ToolButton },
})
export default class OdinDrawer extends Vue {
  arrowIcon = require("../assets/icons/arrow.svg");
  collapsed = true;

  mounted() {}

  handleClick(e: Event) {
    if ((e.target as HTMLElement).id !== "editor") {
      this.collapsed = this.toggle(this.collapsed);
    }
  }
  toggle(value: boolean): boolean {
    if (value) return false;
    else return true;
  }
}
</script>

<style scoped>
.drawer-container {
  font-family: "Gilroy";
  font-weight: 500;
  font-size: 13px;
}
.drawer-bar {
  display: flex;
  position: relative;
  height: 40px;
  width: 100%;
  border-radius: 4px;
  align-items: center;
  padding: 4px 0px;
  cursor: pointer;
}
.button-section > * {
  width: fit-content;
  transition: 0.2s;
}
.rotate {
  transform: rotate(90deg);
}
.select-content {
  overflow: auto;
  background-color: #272727;
  animation: reveal 0.15s ease-in-out 1 forwards;
  border-radius: 10px;
}
.drawer-placeholder {
  font-size: 13px;
  color: #ffffff;
  margin: 0px;
}

.collapsed {
  animation: collapse 0.15s ease-in-out 1 forwards;
}
@keyframes collapse {
  from {
    max-height: 300px;
  }
  to {
    max-height: 0px;
  }
}

@keyframes reveal {
  from {
    max-height: 0px;
  }
  to {
    max-height: 300px;
  }
}
</style>
