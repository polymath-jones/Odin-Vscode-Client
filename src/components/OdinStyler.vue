<template>
  <div class="styler-wrapper">
    <p class="inheritors-label">Select from inheritors</p>
    <editable-select
      :mini="false"
      :editable="true"
      :items="classEntries"
    ></editable-select>
    <tool-button
      style="margin: 32px 0px 0px"
      :pilled="true"
      fill="#6FCF97"
      textFill="#3E3D40"
      placeholder="Cutomize Style"
      @clicked="$emit('openCS')"
    ></tool-button>
    <hr />

    <div class="sections-container custom-scroll">
      <odin-drawer placeholder="Layout">
        <layout-section></layout-section>
      </odin-drawer>
      <odin-drawer placeholder="Background"> </odin-drawer>
      <odin-drawer placeholder="Position"> </odin-drawer>
    </div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import { ToolStates } from "@/services/shared/toolStates";
import LayoutSection from "./LayoutSection.vue";
import OdinDrawer from "./OdinDrawer.vue";
import EditableSelect from "./EditableSelect.vue";
import InputDial from "./InputDial.vue";
import ToolButton from "./ToolButton.vue";
import SmoothScrollbar from "smooth-scrollbar";

@Options({
  props: {},
  components: {
    LayoutSection,
    EditableSelect,
    InputDial,
    ToolButton,
    OdinDrawer,
  },
})
export default class OdinStyler extends Vue {
  classEntries = new Map<string, { text: string; iconSource: string }>();
  beforeMount() {
    SmoothScrollbar.initAll();
    this.classEntries = ToolStates.getInstance().selectEntries;
  }
}
</script>

<style scoped>
.styler-wrapper {
  background-color: #313133;
  border-radius: 20px;
  padding: 12px;
  min-height: 500px;
  height: 100%;
}
.sections-container {
  border-radius: 10px;
  overflow-y: auto;
  max-height: 65vh;
}
hr {
  background-color: #ffff;
  width: calc(100%-12px);
  padding: 0px;
  margin: 16px 0px;
  opacity: 0.1;
}
.inheritors-label {
  margin: 8px;
  font-size: 14px;
  font-family: "Gilroy";
  color: #84828e;
}
</style>
