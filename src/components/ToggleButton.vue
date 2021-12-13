<template>
  <div class="container" @click="handleClick">
    <div class="wrapper">
      <div class="image-wrapper" :class="{ flip: toggled }"><slot></slot></div>
      <p>{{ placeholder }}</p>
    </div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: { placeholder_1: String, placeholder_2: String, id: String },
  components: {},
})
export default class ToggleButton extends Vue {
  toggled = false;
  get placeholder(): string {
    return this.toggled
      ? (this.$props as any).placeholder_2
      : (this.$props as any).placeholder_1;
  }
  handleClick() {
    if (!this.toggled) this.toggled = true;
    else this.toggled = false;
    this.$emit("togglePane", { id: (this.$props as any).id });
  }
  handleHover() {}
}
</script>

<style scoped>
.wrapper {
  width: auto;
  display: flex;
  align-items: center;
  padding: 4px 16px;
  border: 1.7px solid #4d4c51;
  border-radius: 8px;
}
p {
  margin: 0;
  color: #93919e;
  font-family: "Gilroy";
  font-weight: 500;
  font-size: 14px;
  margin: 0 16px;
}
.container:hover p {
  color: #afadb9;
}
.container {
  padding: 0;
  width: fit-content;
  margin: 0;
  user-select: none;
}
.container:hover .wrapper {
  transition-duration: 0.3s;
  border: 1.7px solid #93919e;
  cursor: pointer;
}
.wrapper {
  transition-duration: 0.3s;
}
.image-wrapper {
  transition-duration: 0.3s;
  -moz-transform: scale(1, 1);
  -o-transform: scale(1, 1);
  -webkit-transform: scale(1, 1);
  transform: scale(1, 1);
}
.flip {
  transition-duration: 0.3s;
  -moz-transform: scale(-1, -1);
  -o-transform: scale(-1, -1);
  -webkit-transform: scale(-1, -1);
  transform: scale(-1, -1);
}
</style>

