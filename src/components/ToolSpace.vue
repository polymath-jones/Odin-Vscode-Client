<template>
  <div
    class="grid-container"
    :class="{
      leftPaneClosed: leftPaneClosed,
      rightPaneClosed: rightPaneClosed,
      leftRightPaneClosed: leftPaneClosed && rightPaneClosed,
    }"
  >
    <section class="pane background left-pane">
      <button-stack
        class="marginAuto"
        v-model:buttons="leftPaneButtons"
        :vertical="true"
        :spread="true"
      ></button-stack>
    </section>
    <section>
      <section class="pane background top-pane">
        <section class="tool-wrapper">
          <div class="left-tools">
            <toggle-button
              :id="'toggleLeftPane'"
              @togglePane="handlePaneToggle"
            >
              <img :src="icons['panel']" alt="Toggle panel visibility" />
            </toggle-button>
          </div>
          <button-stack
            v-model:buttons="screenButtons"
            @changed="handleResponsive"
          ></button-stack>

          <div class="right-tools">
            <div class="history-buttons">
              <tool-button
                :imageSource="icons['undo']"
                :outlined="true"
                :toogleable="false"
                @clicked="handleHistory(true)"
              >
              </tool-button>
              <tool-button
                :imageSource="icons['redo']"
                :outlined="true"
                :toogleable="false"
                @clicked="handleHistory(false)"
              >
              </tool-button>
            </div>
            <tool-button
              :imageSource="icons['save']"
              placeholder="Save"
              :outlined="true"
              :toogleable="false"
              @clicked="handleSave"
            >
            </tool-button>
            <toggle-button
              :id="'toggleRigthPane'"
              @togglePane="handlePaneToggle"
            >
              <img :src="icons['rightPanel']" alt="Toggle panel visibility" />
            </toggle-button>
          </div>
        </section>
      </section>

      <section
        id="workspace-container"
        class="workspace-container"
        :class="{
          collapsedLeft: leftPaneClosed,
          collapsedRight: rightPaneClosed,
          collapsedAll: leftPaneClosed && rightPaneClosed,
        }"
      >
        <window-resizer>
          <iframe
            @load="loaded"
            src="/saaspal-free-lite/index.html"
            id="workspace"
            frameborder="0"
            ref="workspace"
          ></iframe>
        </window-resizer>
      </section>
    </section>
    <section class="pane background right-pane">
      <div class="right-pane-selectors">
        <button-stack
          :styled="true"
          fill="#4D4C51"
          :pilled="true"
          v-model:buttons="rightPaneButtons"
          :default="0"
          :wide="true"
        ></button-stack>
      </div>
      <div class="panel-containers">
        <odin-styler @openCS="handleCustomStyler"> </odin-styler>
      </div>
    </section>

    <section class="panels-wrapper">
      <panel
        class="right-pane-panel"
        @panelClosed="handlePanelClose"
        v-model:closed="customStylerClosed"
        heading="Customize Style"
        animation="opacity"
        glassed="true"
        :width="500"
        :height="360"
        fill="#3E3D40D6"
      >
        <prism-editor
          class="my-editor custom-scroll"
          :modelValue="currentStyleSource"
          @input="handleInputChange"
          :highlight="highlighter"
          line-numbers
        ></prism-editor>
        <tool-button
          class="style-editor-button"
          :imageSource="icons['save']"
          placeholder="Save"
          :outlined="true"
          :toogleable="false"
          @clicked="handleStyleSave"
        >
        </tool-button>
      </panel>
      <panel
        class="left-pane-panel"
        @panelClosed="handlePanelClose"
        :closed="true"
        heading="Assets"
        animation="opacity"
        glassed="true"
        :width="400"
        :height="700"
        :glassed="true"
        fill="#3E3D40D6"
      >
      </panel>
      <panel
        class="left-pane-panel"
        @panelClosed="handlePanelClose"
        :closed="true"
        heading="Navigator"
        animation="opacity"
        glassed="true"
        :width="400"
        :height="700"
        :glassed="true"
        fill="#3E3D40D6"
      >
      </panel>
    </section>
  </div>
</template>

<script lang="ts">
/**
 * On element click:: get in-app classes and add to selected array
 * Update the UI vuex state with selected-class style
 * On UI event:: handle event and edit style with toolspace service
 **/

import { Options, Vue } from "vue-class-component";
import { Workspace } from "../services/workspace";
import { StateService } from "../services/shared/stateService";
import { HistoryService } from "../services/shared/historyService";
import { Guidespace } from "../services/guidespace";
import { Toolspace } from "../services/toolspace";

import { ToolStates } from "../services/shared/toolStates";
import ToggleButton from "./ToggleButton.vue";
import OdinStyler from "./OdinStyler.vue";
import ToolButton from "./ToolButton.vue";
import ButtonStack from "./ButtonStack.vue";
import WindowResizer from "./WindowResizer.vue";
import Panel from "./Panel.vue";
import store from "@/store";

import "prismjs/themes/prism-tomorrow.css";

@Options({
  props: {},
  components: {
    ToggleButton,
    ToolButton,
    Panel,
    WindowResizer,
    ButtonStack,
    OdinStyler,
  },
})
export default class HelloWorld extends Vue {
  prism = require("prismjs");
  styleSheet!: HTMLStyleElement;
  root!: HTMLIFrameElement;

  panelClosed = false;
  leftPaneClosed = false;
  rightPaneClosed = false;
  customStylerClosed = true;

  stateService!: StateService;
  historyService!: HistoryService;
  toolspace!: Toolspace;
  gs!: Guidespace;
  ts!: Toolspace;

  toolStates!: ToolStates;
  icons!: any;

  selectTest = new Map<string, { text: string; iconSource: string }>();
  screenButtons = [{ id: "", source: "", state: false, placeholder: "" }];
  leftPaneButtons = [{ id: "", source: "", state: false, placeholder: "" }];
  rightPaneButtons = [{ id: "", source: "", state: false, placeholder: "" }];
  historyButtons = [{ id: "", source: "", placeholder: "" }];
  currentStyleSource = "Start styling to view";

  get maxWidth(): any {
    return store.state.viewData.windowConstriants.max;
  }
  get code(): string {
    return store.state.currentStyleSource;
  }

  beforeMount() {
    StateService.init("");
    this.stateService = StateService.getInstance();

    ToolStates.init();
    this.toolStates = ToolStates.getInstance();

    this.icons = this.toolStates.icons;
    this.historyButtons = this.toolStates.historyButtons;
    this.rightPaneButtons = this.toolStates.rightPaneButtons;
    this.leftPaneButtons = this.toolStates.leftPaneButtons;
    this.screenButtons = this.toolStates.screenButtons;
    this.selectTest = this.toolStates.selectEntries;
  }
  mounted() {
    document.ondragstart = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };
  }
  handleCustomStyler() {
    this.customStylerClosed = false;
  }
  handleSave() {
    const sr = this.historyService.serializeStack(true);
    const storage = window.localStorage;

    storage.setItem("history", sr);
  }
  handleInputChange(code: any) {
    this.currentStyleSource = code.target.value as string;
  }
  handleHistory(state: boolean) {
    if (state) this.historyService.undo();
    else this.historyService.redo();
    this.gs.clear();
  }
  changeScreeButtonState(index: number) {
    this.toggleButtonStates(this.screenButtons, index);
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
  handleResponsive(index: number) {
    switch (this.screenButtons[index].id) {
      case "mobile": {
        store.commit("setWindowConstraints", {
          min: 320,
          max: 425,
        });
        break;
      }
      case "desktop": {
        store.commit("setWindowConstraints", {
          min: 768,
          max: 1024,
        });
        break;
      }

      case "tablet": {
        store.commit("setWindowConstraints", {
          min: 425,
          max: 768,
        });
        break;
      }

      case "landscape": {
        store.commit("setWindowConstraints", {
          min: 425,
          max: 825,
        });
        break;
      }
    }
  }
  handlePanelClose() {
    if (!this.panelClosed) this.panelClosed = true;
  }
  handlePaneToggle(data: any) {
    switch (data.id) {
      case "toggleLeftPane": {
        if (!this.leftPaneClosed) this.leftPaneClosed = true;
        else this.leftPaneClosed = false;
        break;
      }
      case "toggleRigthPane": {
        if (!this.rightPaneClosed) this.rightPaneClosed = true;
        else this.rightPaneClosed = false;
        break;
      }
    }
  }
  handleDialTest(data: { value: number; unit: string }) {
    Toolspace.getInstance().updateStyle({
      declartion: "padding",
      value: data.value + data.unit,
      precedence: false,
    });
  }
  highlighter(code: any) {
    return this.prism.highlight(code, this.prism.languages.css, "css");
  }
  loaded() {
    this.root = this.$refs.workspace as HTMLIFrameElement;
    this.styleSheet = this.root.contentDocument!.createElement("style");
    this.styleSheet.innerHTML = StateService.getInstance()
      .getStyleParser()
      .print() as string;

    this.root.contentDocument?.body.append(this.styleSheet);

    Toolspace.init(this.root, this.styleSheet);
    Workspace.init(this.root);

    this.gs = Guidespace.getInstance();
    this.ts = Toolspace.getInstance();
    this.historyService = HistoryService.getInstance();

    const storage = window.localStorage;
    const sr = storage.getItem("history");

    if (sr) {
      let states = HistoryService.deserializeToStack(sr, true);
      for (let state of states) {
        this.historyService.push(state);
      }
    }
    storage.clear();
    this.initWatchers();
  }
  initWatchers() {
    this.$watch("maxWidth", (value: number, old: number) => {
      if (value <= 425) this.changeScreeButtonState(4);
      else if (value <= 768) this.changeScreeButtonState(2);
      else if (value <= 825) this.changeScreeButtonState(3);
      else if (value <= 1200) this.changeScreeButtonState(1);
      else this.changeScreeButtonState(0);
    });
    this.$watch("code", (value: string, old: string) => {
      this.currentStyleSource = value;
    });
  }
  handleStyleSave() {}
}
</script>

<style scoped>
.my-editor {
  border-radius: 20px;
  background: #2d2d2d;
  color: #ccc;
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  height: 200px;
}

.style-editor-button {
  margin-top: 16px;
  float: right;
}

.prism-editor__textarea:focus {
  outline: none;
}
.marginAuto {
  margin: auto;
}
.color-picker {
  transform: scale(0.83, 0.83);
  transform-origin: top left;
  background-color: rgb(61, 61, 61);
  border: none;
}
#workspace {
  border: none;
  height: auto;
  width: 100%;
}
.grid-container {
  position: relative;
  display: grid;
  height: 100vh;
  grid-template-columns: 54px auto 320px;
  overflow: hidden;
}
.leftPaneClosed {
  grid-template-columns: 0px auto 320px;
}
.rightPaneClosed {
  grid-template-columns: 54px auto 0px;
}

.leftRightPaneClosed {
  grid-template-columns: 0px auto 0px !important;
}
.left-pane,
.right-pane {
  padding: 40px 10px 16px;
  height: 100%;
  overflow: hidden;
}
.left-pane {
  padding: 40px 4px;
}
.workspace-container {
  background-color: #222222;
  position: relative;
  display: flex;
  flex-flow: column;
  height: calc(100vh - 40px);
  max-width: calc(100vw - 374px);
  z-index: 99;
  border-radius: 10px;
}
.collapsedLeft {
  max-width: calc(100vw - 320px);
}
.collapsedRight {
  max-width: calc(100vw - 54px);
}
.collapsedAll {
  max-width: 100vw;
}
iframe {
  border-radius: 10px;
}
.left-tools,
.right-tools {
  display: flex;
  min-width: 220px;
}
.left-pane-panel {
  position: absolute;
  top: 44px;
  left: 56px;
  z-index: 99;
}
.right-pane-panel {
  position: absolute;
  top: 44px;
  left: calc(100vw - 844px);
  z-index: 99;
}

.left-tools > * {
  margin-right: 10px;
}
.right-tools > * {
  margin-left: 10px;
}
.history-buttons {
  display: flex;
}
.top-pane {
  max-width: 100%;
  padding: 2px;
  height: 40px;
  margin: 1px 0 1px 0;
}
.background {
  position: relative;
}
.tool-wrapper {
  height: 100%;
  display: flex;
  justify-content: space-between;
}
.tool-wrapper > * {
  margin: 0 8px;
}
.right-pane {
  display: flex;
  flex-direction: column;
}
.panel-containers {
  margin-top: 16px;
  flex-grow: 1;
}
</style>