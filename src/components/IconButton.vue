<template>
  <div
    ref="wrapper"
    :class="{ 'button-active': active }"
    class="button-wrapper"
    :id="id"
  >
    <div
      @click="handler"
      :class="{ 'button-active': active }"
      class="image-container"
    >
      <img class="button-image" :src="source" alt="" />
    </div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: { source: String, small: Boolean, id: String },
  components: {},
})
export default class IconButton extends Vue {
  active = false;
  handler() {
    if (this.active) this.active = false;
    else this.active = true;
    this.$emit("ibclicked", { id: (this.$refs.wrapper as HTMLElement).id });
  }
}
</script>

<style scoped>
.button-image {
  width: 20px;
}

.button-active {
  opacity: 1 !important;
  border-radius: 4px 4px 0px 0px !important;
}

.image-container:hover,
.button-wrapper:hover {
  opacity: 0.75;
}
.image-container {
  cursor: pointer;
  opacity: 0.5;
  padding: 10px 20px;
  width: fit-content;
  height: 40px;
}
.button-wrapper {
  opacity: 0.6;
  background: rgba(255, 255, 255, 0.096);
  width: fit-content;
  border-radius: 4px;
}
.image-container,
.button-wrapper {
  transition-duration: 100ms;
  transition-timing-function: ease-in-out;
}
</style>

