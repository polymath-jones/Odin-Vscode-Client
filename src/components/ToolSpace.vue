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
      <toggle-button-stack
        class="marginAuto"
        :buttons="leftPaneButtons"
        :vertical="true"
        :spread="true"
      ></toggle-button-stack>
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
            <!-- <tool-button
              :imageSource="icons['expand']"
              :outlined="true"
              :toogleable="false"
              placeholder="Full View"
            >
            </tool-button> -->
          </div>

          <!-- Responsive buttons  -->
          <!-- <toggle-button-stack
            :pilled="true"
            :buttons="buttonstest"
            :default="0"
            @stateChanged="handleResponsive"
          ></toggle-button-stack> -->

          <button-stack
            v-model:buttons="screenButtons"
            @changeScreen="handleResponsive"
          ></button-stack>

          <div class="right-tools">
            <div class="history-buttons">
              <tool-button
                :imageSource="icons['undo']"
                :outlined="true"
                :toogleable="false"
              >
              </tool-button>
              <tool-button
                :imageSource="icons['redo']"
                :outlined="true"
                :toogleable="false"
              >
              </tool-button>
            </div>
            <tool-button
              :imageSource="icons['save']"
              placeholder="Save"
              :outlined="true"
              :toogleable="false"
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
        <toggle-button-stack
          :styled="true"
          fill="#4D4C51"
          :pilled="true"
          :buttons="rightPaneButtons"
          :default="0"
          :wide="true"
        ></toggle-button-stack>

        <!-- styler component -->
      </div>
      <div class="panel-containers">
        <layout-section></layout-section>
        <editable-select
          :mini="false"
          :editable="true"
          :items="selectTest"
        ></editable-select>

        <input-dial @valueChanged="handleDialTest"></input-dial>
      </div>
    </section>
    <panel
      class="left-pane-panel"
      @panelClosed="handlePanelClose"
      :closed="panelClosed"
      heading="Add Object"
      animation="opacity"
      glassed="true"
      :width="400"
      :height="700"
      :glassed="true"
      fill="#3E3D40D6"
    >
    </panel>
  </div>
</template>

<script lang="ts">
/**
 *
 * On element click:: get in-app classes and add to selected array
 * Update the UI vuex state with selected-class style
 * On UI event:: handle event and edit style with toolspace service
 *
 *
 *
 *
 **/

import { Options, Vue } from "vue-class-component";
import { Workspace } from "../services/workspace";
import { StateService } from "../services/shared/stateService";
import { HistoryService } from "../services/shared/historyService";
import { Guidespace } from "../services/guidespace";
import { Toolspace } from "../services/toolspace";
import ColorPicker from "vue3-ts-picker";
import DynamicTab from "./DynamicTab.vue";
import ToggleButton from "./ToggleButton.vue";
import ToolButton from "./ToolButton.vue";
import ToggleButtonStack from "./ToggleButtonStack.vue";
import ButtonStack from "./ButtonStack.vue";
import WindowResizer from "./WindowResizer.vue";
import Panel from "./Panel.vue";
import EditableSelect from "./EditableSelect.vue";
import LayoutSection from "./LayoutSection.vue";
import InputDial from "./InputDial.vue";
import Scrollbar from "smooth-scrollbar";
import store from "@/store";

@Options({
  props: {},
  components: {
    ColorPicker,
    DynamicTab,
    ToggleButton,
    ToolButton,
    ToggleButtonStack,
    InputDial,
    Panel,
    WindowResizer,
    EditableSelect,
    LayoutSection,
    ButtonStack,
  },
})
export default class HelloWorld extends Vue {
  styleSheet!: HTMLStyleElement;
  root!: HTMLIFrameElement;
  selected!: Array<HTMLElement>;
  selectedClasses!: Array<string>;
  currentEditable!: HTMLElement | undefined;

  shiftDown = false;
  altDown = false;
  ctrlDown = false;
  mouseDown = false;
  editing = false;
  wasDragging = false;
  wasSelecting = false;
  panelClosed = false;
  leftPaneClosed = false;
  rightPaneClosed = false;

  start = [0, 0];
  offset = [0, 0];
  top = 0;
  color = "";
  display = "";

  stateService!: StateService;
  historyService!: HistoryService;
  toolspace!: Toolspace;
  gs!: Guidespace;
  ts!: Toolspace;

  icons: { [key: string]: string } = {
    panel: "panel.svg",
    rightPanel: "rightPanel.svg",
    expand: "expand.svg",
    add: "add.svg",
    assets: "assets.svg",
    navigation: "navigation.svg",
    mobile: "mobile.svg",
    desktop: "desktop.svg",
    landscape: "landscape.svg",
    wide: "wide.svg",
    tablet: "tablet.svg",
    undo: "undo.svg",
    redo: "redo.svg",
    save: "save.svg",
    actions: "actions.svg",
    style: "style.svg",
    settings: "settings.svg",
  };

  selectTest = new Map<string, { text: string; iconSource: string }>();
  buttonstest: any;
  historyButtons: any;
  rightPaneButtons: any;
  leftPaneButtons: any;
  screenButtons = [{ id: "", source: "", state: false }];

  get maxWidth(): any {
    const max = store.state.viewData.windowConstriants.max;
    return max;
  }
  beforeMount() {
    StateService.init("");
    this.stateService = StateService.getInstance();

    for (let icon in this.icons) {
      const filename = this.icons[icon];
      const path = require(`../assets/icons/${filename}`);
      this.icons[icon] = path;
    }

    this.buttonstest = [
      {
        id: "wide",
        source: this.icons["wide"],
        /* placeholder: "mobile size", */
      },
      {
        id: "desktop",
        source: this.icons["desktop"],
        /*  placeholder: "desktop size", */
      },
      {
        id: "tablet",
        source: this.icons["tablet"],
        /* placeholder: "mobile size", */
      },
      {
        id: "landscape",
        source: this.icons["landscape"],
        /* placeholder: "mobile size", */
      },
      {
        id: "mobile",
        source: this.icons["mobile"],
        /* placeholder: "mobile size", */
      },
    ];

    this.historyButtons = [
      {
        id: "undo",
        source: this.icons["undo"],
        /* placeholder: "mobile size", */
      },
      {
        id: "redo",
        source: this.icons["redo"],
        /*  placeholder: "desktop size", */
      },
    ];

    this.rightPaneButtons = [
      {
        id: "style",
        source: this.icons["style"],
        placeholder: "Style",
      },
      {
        id: "settings",
        source: this.icons["settings"],
        placeholder: "Settings",
      },
      {
        id: "actions",
        source: this.icons["actions"],
        placeholder: "Actions",
      },
    ];

    this.leftPaneButtons = [
      {
        id: "add",
        source: this.icons["add"],
      },
      {
        id: "navigation",
        source: this.icons["navigation"],
      },
      {
        id: "assets",
        source: this.icons["assets"],
      },
    ];

    this.selectTest.set("item1", {
      text: "Item 1",
      iconSource: this.icons["settings"],
    });
    this.selectTest.set("item2", {
      text: "Item 2",
      iconSource: this.icons["settings"],
    });
    this.selectTest.set("item3", {
      text: "Item 3",
      iconSource: this.icons["settings"],
    });

    this.screenButtons = [
      {
        id: "wide",
        source: this.icons["wide"],
        state: true,
      },
      {
        id: "desktop",
        source: this.icons["desktop"],
        state: false,
      },
      {
        id: "tablet",
        source: this.icons["tablet"],
        state: false,
      },
      {
        id: "landscape",
        source: this.icons["landscape"],
        state: false,
      },
      {
        id: "mobile",
        source: this.icons["mobile"],
        state: false,
      },
    ];
    this.$watch("maxWidth", (value: number, old: number) => {
      if (value <= 425) this.changeScreeButtonState(4);
      else if (value <= 768) this.changeScreeButtonState(2);
      else if (value <= 825) this.changeScreeButtonState(3);
      else if (value <= 1200) this.changeScreeButtonState(1);
      else this.changeScreeButtonState(0);
    });
  }
  changeScreeButtonState(index: number) {
    for (let i = 0; i < this.screenButtons.length; i++) {
      if (i == index) {
        if (!this.screenButtons[index].state) {
          this.screenButtons[index].state = true;
        }
      } else {
        this.screenButtons[i].state = false;
      }
    }
  }
  handleResponsive(index: number) {
    switch (this.buttonstest[index].id) {
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
      declartion: "position",
      value: "relative",
      precedence: false,
    });
    Toolspace.getInstance().updateStyle({
      declartion: "top",
      value: data.value + data.unit,
      precedence: false,
    });
  }
  loaded() {
    Scrollbar.initAll();
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
  }
}
</script>

<style scoped>
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
  height: 100%;
  width: 100%;
}
.grid-container {
  position: relative;
  display: grid;
  height: 100vh;
  grid-template-columns: 54px auto 260px;
  overflow: hidden;
}
.leftPaneClosed {
  grid-template-columns: 0px auto 260px;
}
.rightPaneClosed {
  grid-template-columns: 54px auto 0px;
}

.leftRightPaneClosed {
  grid-template-columns: 0px auto 0px !important;
}
.left-pane,
.right-pane {
  padding: 40px 10px;
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
  height: 100%;
  max-width: calc(100vw - 314px);
  z-index: 99;
  border-radius: 10px;
}
.collapsedLeft {
  max-width: calc(100vw - 260px);
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
</style>