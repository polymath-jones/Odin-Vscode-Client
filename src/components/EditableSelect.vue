
/**
Props:: header image source, currentItem (can come from data) , fill, pilled, outlined, editable, item data(can contain image source)
Events:: selected, edited (sync)
States:: collapsed, editing

Bar:: contains arrow icon, header icon, input bar with placeholder
Items:: text icon id (map:: id -> text icon)


 */  


<template>
  <div
    class="select-container"
    ref="select"
    @keydown="handleKeyDown"
    :class="{ minimize: mini }"
  >
    <div @click="handleClick" class="select-bar" :class="{ mini: dialMode }">
      <div class="input-container">
        <img
          v-if="imageSource && mini"
          :src="imageSource"
          class="select-icon"
        />
        <p v-if="!editing && !dialMode" class="select-text">
          {{ currentItem }}
        </p>
        <input
          autocomplete="off"
          ref="editor"
          id="editor"
          @blur="handleBlur"
          :value="currentItem"
          v-if="editable && editing && !mini && !dialMode"
          type="text"
          class="item-editor"
        />
        <input
          autocomplete="off"
          ref="editor"
          id="editor"
          @blur="handleBlur"
          :value="unitValue"
          v-if="dialMode"
          type="text"
          class="item-editor"
          :class="{ dialInput: dialMode }"
        />
      </div>

      <div class="button-section">
        <tool-button
          @clicked="handleEdit"
          v-if="editable && !mini"
          :outlined="true"
          :compact="false"
          :imageSource="editIcon"
        >
        </tool-button>
        <tool-button
          class="tool-button"
          :compact="true"
          :imageSource="arrowIcon"
          :class="{ rotate: collapsed }"
        >
        </tool-button>
      </div>
    </div>
    <div
      data-scrollbar
      :class="{ collapsed: collapsed }"
      class="select-content"
    >
      <div
        @click="handleSelect(id)"
        class="select-item"
        v-if="items"
        v-for="([id, value], index) in items"
      >
        <img v-if="!mini" class="select-icon" :src="value.iconSource" alt="" />
        <span class="item-text">{{ value.text }}</span>
      </div>
      <div
        @click="handleSelect(index)"
        class="select-item"
        v-if="dialMode"
        v-for="(unit, index) in units"
      >
        <span class="item-text">{{ unit }}</span>
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
    imageSource: String,
    pilled: Boolean,
    outlined: Boolean,
    editable: Boolean,
    items: Map,
    wide: Boolean,
    mini: Boolean,
    dialMode: Boolean,
    value: Number,
  },
  components: { ToolButton },
})
export default class EditableSelect extends Vue {
  arrowIcon = require("../assets/icons/arrow.svg");
  editIcon = require("../assets/icons/edit.svg");
  collapsed = true;
  editing = false;
  currentItem = "";
  currentId = "";
  currentUnit = 0;
  units = ["px", "fr", "deg", "rem", "em"];

  get items() {
    return (this.$props as any).items! as Map<
      string,
      { text: string; iconSource: string }
    >;
  }
  get dialMode() {
    return (this.$props as any).dialMode as Boolean;
  }
  get unitValue() {
    return (
      Math.floor((this.$props as any).value) + this.units[this.currentUnit]
    );
  }

  mounted() {
    this.currentItem = this.items?.values().next().value.text;
    if (this.dialMode) this.currentItem = this.unitValue;
    Scrollbar.initAll({ alwaysShowTracks: true });

    document.addEventListener("click", (e) => {
      const elt = this.$refs.select as HTMLElement;
      if (elt)
        if (!elt.contains(e.target! as Node)) {
          this.collapsed = true;
        }
    });
  }
  handleKeyDown(e: KeyboardEvent) {
    if (e.key == "Escape" || e.key == "Enter") {
      this.$nextTick(() => (this.$refs as any).editor.blur());
      if (this.editing) this.editing = false;
    }
  }
  handleClick(e: Event) {
    if ((e.target as HTMLElement).id !== "editor") {
      if (!this.editing) this.collapsed = this.toggle(this.collapsed);
    }
  }
  handleEdit() {
    if (!this.editing) {
      this.editing = true;
      this.$nextTick(() => (this.$refs as any).editor.focus());
    }
  }

  handleSelect(id: string | number) {
    if (!this.dialMode) {
      this.currentItem = this.items.get(id as string)?.text!;
      this.currentId = id as string;
      this.collapsed = this.toggle(this.collapsed);
      this.$emit("itemSelect", { id: this.currentId });
    } else {
      this.collapsed = this.toggle(this.collapsed);
      this.currentUnit = id as number;
      this.currentItem = this.unitValue;
      this.$emit("unitChanged", { unit: this.units[this.currentUnit] });
    }
  }

  handleBlur(e: Event) {
    this.editing = false;
    this.checkEdited(e.target!);
  }
  checkEdited(target: EventTarget) {
    const value = (target as HTMLInputElement).value;
    if (value !== this.currentItem) {
      if (this.dialMode) {
        var num = Number.parseInt(value.replace(/[^\d-]/g, ""));
        if (num || num == 0) this.$emit("update:value", num);
        else this.currentItem = this.unitValue;
      } else this.$emit("itemEdit", { id: this.currentId, value: value });
    }
  }

  toggle(value: boolean): boolean {
    if (value) return false;
    else return true;
  }
}
</script>

<style scoped>
.minimize {
  width: 80px;
  font-size: 12px !important;
}
.dialInput {
  width: 40px;
}
.minimize > .select-bar {
  height: 30px;
  padding: 4px 4px;
}
.minimize > .select-content {
  height: 150px;
}
.minimize > * .item-text {
  margin: 0px 4px 0px 4px;
}

.select-container {
  font-family: "Gilroy";
  font-weight: 500;
  font-size: 14px;
}
.select-bar {
  display: flex;
  position: relative;
  height: 40px;
  width: 100%;
  border-radius: 4px;
  background-color: #272727;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  cursor: pointer;
}
.button-section {
  display: flex;
}
.tool-button {
  transition-duration: 0.15s;
}
.rotate {
  transform: rotate(90deg);
}
.input-container {
  display: flex;
  align-items: center;
}

.select-content {
  overflow: hidden;
  height: 300px;
  background-color: #2e2d2d;
  animation: reveal 0.15s ease-in-out 1 forwards;
  border-radius: 0px 0px 4px 4px;
}
.select-item {
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  color: rgb(255, 255, 255);
}
.item-text {
  margin: 0px 16px;
}
.select-text {
  color: rgb(255, 255, 255);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0px 8px 0px 8px;
}
.select-icon {
  height: 16px;
  width: 16px;
  opacity: 0.2;
  transition-duration: 0.2;
}
.select-item:hover .select-icon {
  opacity: 1;
}

.select-item:hover {
  background-color: rgba(255, 255, 255, 0.068);
}
.item-editor {
  width: 90%;
  background-color: transparent;
  color: white;
  border: solid 1.7px #38383b;
  border-radius: 4px;
  padding: 2px;
  outline: none;
}
input[type="text"]:focus {
  border-color: #4e4e52;
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
