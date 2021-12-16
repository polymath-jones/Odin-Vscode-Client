/* 

Can accept images and placeholder
emits clicked event
variants are toggle, outlined, nofill, fill, highlight
Buttons can be togglable, pressed.

*/

 <template>
  <div
    class="container"
    @click="handleClick"
    :class="{
      outlined: outlined,
      pilled: pilled,
      highlighted: highlighted,
      nofill: !pressedState,
    }"
    :style="`background-color: ${fill}`"
  >
    <div class="wrapper" :class="{ compact: compact }">
      <img
        class="button-image"
        :class="{ pressed: pressedState }"
        :src="imageSource"
        alt=""
      />

      <p :class="{ none: !pressedState }" v-if="placeholder">
        {{ placeholder }}
      </p>
    </div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
@Options({
  props: {
    outlined: Boolean,
    fill: String,
    highlighted: Boolean,
    placeholder: String,
    imageSource: String,
    pilled: Boolean,
    pressedState: Boolean,
    state: Boolean,
    id: String,
    compact: Boolean,
  },
  components: {},
})
export default class StackButton extends Vue {
  pressed = false;

  get pressedSate(): boolean {
    const value = (this.$props as any).pressedSate || this.pressed;
    return value;
  }

  handleClick() {
    if (!this.pressed) {
      this.$emit("clicked", { id: (this.$props as any).id });
      this.pressed = true;
    }

   // this.$emit('update:state', this.pressed)
  }
  mounted() {}
}
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  box-sizing: content-box;
  padding: 0;
  width: fit-content;
  margin: 0;
  user-select: none;
  border-radius: 4px;
  cursor: pointer;
}
.wrapper {
  width: fit-content;
  display: flex;
  align-items: center;
  padding: 4px 16px;
}
.compact {
  padding: 4px 8px;
}
.images-wrapper {
  height: 20px;
}
.none {
  display: none;
}
img {
  transition-duration: 0.1s;

  opacity: 0.5;
}
p {
  margin: 0;
  color: #93919e;
  font-family: "Gilroy";
  font-weight: 500;
  font-size: 14px;
  margin: 0 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.container:hover p {
  color: #afadb9;
}
.container:hover img:not(.pressed) {
  opacity: 0.7;
}
.pressed {
  opacity: 1;
}
.outlined {
  border: 1.7px solid #4d4c51;
}
.nofill {
  background-color: transparent !important;
}
.pilled {
  border-radius: 100px;
}
.highlighted {
  border-image-source: linear-gradient(
    181.85deg,
    rgba(255, 255, 255, 0.507) -235.64%,
    rgba(255, 255, 255, 0) 29.97%
  );
  box-shadow: 5.5px 9.6px 13.7px 0px #00000017;
}
.outlined:hover {
  transition-duration: 0.3s;
  border: 1.7px solid #93919e;
}
</style>
