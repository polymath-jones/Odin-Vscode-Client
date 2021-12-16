/* 
props: closed width height, animation: left,right, bottom, top, opacity
 */

 <template>
  <div
    class="panel-container opacityReveal"
    :style="`min-width: ${width}px; min-height: ${height}px; max-width: ${width}px; max-height: ${height}px;background-color: ${fill}`"
    :class="{ closed: closedState, glass: glassed }"
  >
    <div class="panel-header">
      <p class="panel-heading">{{ heading }}</p>
      <tool-button
        class="panel-button"
        @clicked="handleClick"
        :imageSource="closeIcon"
      >
      </tool-button>
    </div>
    <hr />
    <div
      :style="`max-height: ${height}px;`"
      class="panel-content"
      data-scrollbar
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import ToolButton from "./ToolButton.vue";
import Scrollbar from "smooth-scrollbar";


@Options({
  props: {
    heading: String,
    closed: Boolean,
    width: Number,
    height: Number,
    animation: String,
    glassed: Boolean,
    fill: String,
  },
  components: { ToolButton },
})
export default class Panel extends Vue {
  closeIcon = "";
  closedState = false;

  get closed(): boolean {
    const value = (this.$props as any).closed;
    return value;
  }

  mounted() {
    Scrollbar.initAll()
    this.closedState = (this.$props as any).closed;
    this.$watch("closed", (value: any, old: any) => {
      this.closedState = value as boolean;
    });
  }

  handleClick() {
    this.$emit("panelClosed", {});
  }
  beforeMount() {
    this.closeIcon = require("../assets/icons/close.svg");
  }
}
</script>

<style scoped>

.glass{
  backdrop-filter: blur(40px);
}

.panel-container {
  padding: 24px 0px;
  border-radius: 8px;
  overflow: hidden;
}
.panel-header {
  padding: 0px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #B2B1B6;
  font-family: "Gilroy";
  font-weight: 500;
  font-size: 14px;
}
.panel-heading {
  margin: 0px;
  height: fit-content;
}
.panel-button {
  transform: translateX(25%);
}
hr {
  background-color: #ffff;
  width: calc(100%-32px);
  padding: 0px ;
  margin: 13px 16px;
  opacity: 0.1;
}
.panel-content{
  padding: 16px;
}
.closed > * {
  display: none;
}
.closed {
  animation: opacityHide 0.3s ease-in-out 1 forwards !important;
}
.opacityReveal {
  animation: opacityReveal 0.3s ease-in-out 1 forwards;
}
@keyframes opacityReveal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes opacityHide {
  0% {
    opacity: 1;
  }
  90% {
    min-height: initial;
    padding: initial;
    opacity: 0;
  }
  100% {
    min-height: 0px;
    padding: 0px;
  }
}
</style>
