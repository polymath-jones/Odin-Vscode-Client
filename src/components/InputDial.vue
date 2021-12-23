<template>
  <div class="dial-container">
    <div ref="base" @dblclick="handleDoubleClick" class="dial-base">
      <div class="dial-bar" :style="style">
        <div
          @mousedown="handleMouseDown"
          :class="{ circleHover: mouseDown }"
          class="circle"
        ></div>
      </div>
    </div>
    <editable-select
      :mini="true"
      :dialMode="true"
      :value="val"
      :class="{ noevents: mouseDown }"
      @valueChanged="handleInputChanged"
      @unitChanged="handleUnitChange"
    ></editable-select>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
import EditableSelect from "./EditableSelect.vue";

@Options({
  props: { value: Number },
  components: {
    EditableSelect,
  },
})
export default class InputDial extends Vue {
  mouseDown = false;
  externalChange = false;
  angle = 0.0;
  style = "";
  startX = 0;
  startY = 0;
  weight = 20;
  val = 0;
  revs = 1;
  currentUnit = "px";
  floatUnits = ["em", "rem"];
  startTime = 0;

  get value(): number {
    return (this.$props as any).value;
  }

  mounted() {
    this.val = this.value;

    //update on external mods
    this.$watch("value", (val: number, _old: number) => {
      this.externalChange = true;
      this.val = val;
    });

    //map bidirectional val to degree
    this.$watch("val", (val: number, old: number) => {
      if (!this.mouseDown) {
        this.angle = (360 * val) / this.weight;
        this.style = `transform: rotate(${this.angle}deg);`;
      }
      if (!this.externalChange) {
        this.$emit("update:value", val);
        this.$emit("valueChanged", {
          value: val,
          unit: this.currentUnit,
        });
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (this.mouseDown) {
        const rect = (this.$refs.base as HTMLElement).getBoundingClientRect();
        const delta =
          (this.getAngle(
            rect.x + rect.width / 2,
            rect.y + rect.height / 2,
            this.startX,
            this.startY,
            e.clientX,
            e.clientY
          ) *
            180) /
          Math.PI;
        this.angle += delta;
        this.revs = Math.floor(Math.abs(this.angle / 360) + 1);
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.style = `transform: rotate(${this.angle}deg);`;
        let weight = this.floatUnits.includes(this.currentUnit)
          ? 1
          : this.weight;
        this.externalChange = false;
        this.val += (delta / 360) * weight * this.revs;
        this.val =  Number.parseFloat(this.val.toFixed(1));
      }
    });
    document.addEventListener("mouseup", (e) => {
      if (this.mouseDown) {
        this.mouseDown = false;
        this.angle = this.angle % 360;
        this.revs = 1;
        this.weight = 20;
        //console.log();
      }
    });
  }
  handleInputChanged(data: any) {
    this.externalChange = false;
    let num = Number.parseFloat(data.target.value.replace(/[^\d-.]/g, ""));
    num = Number.parseFloat(num.toFixed(1));
    this.val = num;
  }
  handleDoubleClick() {
    this.externalChange = false
    this.val = 0;
  }
  handleUnitChange(data: { unit: string }) {
    this.currentUnit = data.unit;
  }
  canEmit(interval: number): boolean {
    const now = Date.now();
    if (this.startTime == 0) this.startTime = now;
    const delta = now - this.startTime;
    if (delta > interval) {
      this.startTime = now;
      return true;
    }
    return false;
  }
  handleMouseDown(e: MouseEvent) {
    if (!this.mouseDown) {
      this.mouseDown = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
    }
  }
  toggle(value: boolean): boolean {
    if (value) return false;
    else return true;
  }
  getAngle(
    centerX: number,
    centerY: number,
    oldX: number,
    oldY: number,
    newX: number,
    newY: number
  ) {
    var x1 = oldX - centerX;
    var y1 = oldY - centerY;
    var x2 = newX - centerX;
    var y2 = newY - centerY;
    var d1 = Math.sqrt(x1 * x1 + y1 * y1);
    var d2 = Math.sqrt(x2 * x2 + y2 * y2);

    return Math.asin((x1 / d1) * (y2 / d2) - (y1 / d1) * (x2 / d2));
  }
}
</script>

<style scoped>
.dial-container {
  width: fit-content;
  user-select: none;
  padding: 12px 8px;
  border: 1.7px solid #514f55;
  border-radius: 8px;
}
.dial-base:hover {
  transition-duration: 0.2s;
  background-color: rgb(75, 73, 73);
}

.dial-base {
  padding: 4px;
  margin: 0px auto 16px;
  width: 40px;
  height: 40px;
  border-radius: 100px;
  background-color: rgb(65, 65, 65);
  box-shadow: 30px 6px 13px 0px #00000017 inset;
  box-shadow: 0px 5px 5px 0px #00000017;
}
.dial-bar {
  width: fit-content;
  margin: auto;
  height: 100%;
}
.circle {
  transition-duration: 0.2s;
  width: 14px;
  height: 14px;
  background-color: rgb(209, 209, 209);
  border-radius: 40px;
  box-shadow: 0px 5.5px 5.5px 0px #00000040 inset;
}
.circleHover,
.circle:hover {
  background: #ffde6a;
}
.noevents {
  pointer-events: none;
}
</style>
