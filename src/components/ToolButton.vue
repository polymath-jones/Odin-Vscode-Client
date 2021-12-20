/* 
 can accept images and placeholder
 emits clicked event
 variants are toggle, outlined, nofill, fill, highlight


buttons can be togglable, pressed 

 */

 <template>
  <div
    class="container"
    @click="handleClick"
    :class="{ outlined: outlined, pilled: pilled, highlighted: highlighted }"
    :style="`background-color: ${fill}`"
  >
    <div class="wrapper" :class="{ compact: compact }">
      <img
        class="button-image"
        :class="{ pressed: pressed }"
        :src="imageSource"
        alt=""
      />
      <p v-if="placeholder" :style="`color: ${textFill}`">{{ placeholder }}</p>
    </div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
@Options({
  props: {
    toogleable: Boolean,
    outlined: Boolean,
    fill: String,
    textFill: String,
    highlighted: Boolean,
    placeholder: String,
    imageSource: String,
    pilled: Boolean,
    id: String,
    compact:Boolean 
  },
  components: {},
})
export default class ToolButton extends Vue {
  pressed = false;

  get toogleable(): boolean {
    return (this.$props as any).toogleable;
  }

  handleClick() {
    if (this.toogleable) {
      if (!this.pressed) this.pressed = true;
      else this.pressed = false;
    }
    this.$emit("clicked", { id: (this.$props as any).id });
  }
  mounted() {
    if ((this.$props as any).toogleable == false) this.pressed = true;
  }
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
  border-radius: 8px;
  cursor: pointer;
}
.wrapper {
  width: fit-content;
  height: fit-content;
  display: flex;
  padding: 8px 16px;
}
.images-wrapper {
  height: fit-content;
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
.pilled {
  border-radius: 100px;
}
.compact {
  padding: 4px 8px;
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
