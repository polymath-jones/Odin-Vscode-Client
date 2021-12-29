<template>
  <div class="catalogue-container">
    <div class="odin-element" id="odin-div-block"><p>Div Block</p></div>
    <div class="odin-element" id="odin-paragraph-block">
      <p>
        Paragraph Block
        <br />
        <span style="opacity: 0.3; font-size: 10px"
          >Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium
        </span>
      </p>
    </div>
    <div class="odin-element" id="odin-section-block"><p>Section Block</p></div>
  </div>
</template>

<script lang ="ts">
import { Options, Vue } from "vue-class-component";
@Options({
  props: {},
  components: {},
})
export default class OdinCatalogue extends Vue {
  divBlock = `<div style="width: 100%; height: 200px; background-color: gray;" draggable='true' dropzone='true'></div>`;
  paragraphBlock = `<p style="width: 100%; font-size: 16px; font-family: Arial; color: black;" draggable='true' dropzone='true'>
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem
    accusantium
  </p>`;
  sectionBlock = `<section style="width: 100%; height: 300px; background-color: black;" draggable='true' dropzone='true'></section>`;

  handleDrag = (e: DragEvent) => {
    const elt = e.target as HTMLElement;
    switch (elt.id) {
      case "odin-div-block": {
        e.dataTransfer?.setData("text/html", this.divBlock);
        break;
      }
      case "odin-paragraph-block": {
        e.dataTransfer?.setData("text/html", this.paragraphBlock);
        break;
      }
      case "odin-section-block": {
        e.dataTransfer?.setData("text/html", this.sectionBlock);
        break;
      }
    }
    e.stopPropagation();
  };

  mounted() {
    let elts = document.getElementsByClassName("odin-element");
    for (let i = 0; i < elts.length; i++) {
      let elt = elts[i] as HTMLElement;
      elt.setAttribute("draggable", "true");
      elt.addEventListener("dragstart", this.handleDrag, true);
    }
  }
}
</script>

<style scoped>
.catalogue-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 100px;
  justify-items: center;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  width: 100%;
  height: 500px;
  border-radius: 20px;
  background-color: #2d2d2d;
  padding: 20px;
}
#odin-div-block {
  width: 100%;
  height: 100px;
}
#odin-paragraph-block {
  padding: 10px;
  width: 100%;
  height: 100px;
}
#odin-section-block {
  width: 100%;
  height: 150px;
}
.odin-element {
  transition: 0.1s;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  border-color: #ffffff49;
}
.odin-element:hover {
  border-color: #ffffff;
}
.odin-element > p {
  color: white;
  font-family: "Gilroy";
  font-weight: 500;
  font-size: 12px;
  width: fit-content;
  margin: 0 auto;
}
</style>
