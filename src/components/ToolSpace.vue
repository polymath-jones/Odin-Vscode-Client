<template>
  <div class="jiop">
    <input @change="change" :value="top" type="number" name="" id="in" />
    <iframe
      @load="loaded"
      src="/in.html"
      id="workspace"
      width="100%"
      height="900px"
      frameborder="0"
      ref="workspace"
    ></iframe>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Workspace } from "../services/workspace";
import { StyleParser } from "../services/lib/styleParser";
import { Guidespace, SELECTION_MODE } from "../services/guidespace";

@Options({
  props: {},
})
export default class HelloWorld extends Vue {
  styleSheet!: HTMLStyleElement;
  root!: HTMLIFrameElement;
  resizeObserver?: ResizeObserver;
  styleParser!: StyleParser;
  styleCache: Array<string> = new Array();
  selected!: Array<HTMLElement>;
  shiftDown = false;
  ctrlDown = false;
  mouseDown = false;
  wasDragging = false;
  wasSelecting = false;
  start = [0, 0];
  offset = [0, 0];
  gs!: Guidespace;
  currentEditable!: HTMLElement;
  top = 0;

  change(e: InputEvent) {
    var top = (e.target as HTMLInputElement).value;
    this.selected.forEach((elt) => {
      elt.classList.add("omo");
    });

    this.styleParser.update(".omo", "left", top + "px");
    this.styleParser.update(".omo", "top", top + "px");

    this.styleSheet.innerHTML = this.styleParser.print()
      ? (this.styleParser.print() as string)
      : "";

    this.gs.clear();
    this.gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT);
  }
 
  loaded() {
    this.root = this.$refs.workspace as HTMLIFrameElement;
    Workspace.init(this.root);
    this.styleSheet = this.root.contentDocument!.createElement("style");
    this.root.contentDocument?.body.append(this.styleSheet);
    this.selected = Workspace.getInstance().selected;
    this.styleParser = new StyleParser("");
    this.gs = Guidespace.getInstance();
    this.registerHooks();
  }
  registerHooks() {
    this.styleParser.create(
      undefined,
      ".omo",
      `{ 
        position:relative;
        top:initial; 
        left:initial
      }`
    );

    this.root.contentDocument!.addEventListener("dblclick", (e) => {
      var elt = e.target as HTMLElement;
      this.currentEditable = elt;
      elt.setAttribute("contenteditable", "true");
      elt.style.cursor = "text";
      elt.focus();
    });
    this.root.contentDocument!.addEventListener(
      "click",
      (e: MouseEvent) => {
        var elt = e.target! as HTMLElement;

        if (this.currentEditable && elt != this.currentEditable) {
          this.currentEditable.setAttribute("contenteditable", "false");
          this.currentEditable.style.cursor = "initial";
        }

        if (
          !["body", "html"].includes(elt.tagName.toLowerCase()) &&
          !this.ctrlDown
        ) {
          if (!this.selected.includes(elt) && this.selected.length <= 1) {
            this.selected.splice(0, this.selected.length);
            this.selected.push(elt);
          } else if (this.selected.length > 1) {
            this.selected.splice(0, this.selected.length);
            this.selected.push(elt);
          }
        } else if (
          !["body", "html"].includes(elt.tagName.toLowerCase()) &&
          this.ctrlDown
        ) {
          console.log("manual multiselecting");
          if (!this.selected.includes(elt)) {
            this.selected.push(elt);
          } else {
            this.selected.splice(this.selected.indexOf(elt), 1);
          }
        }
        this.gs.clear();
        this.gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT);

        e.stopPropagation();
        e.preventDefault();
      },
      true
    );
    this.root.contentDocument!.addEventListener(
      "mousedown",
      (e: MouseEvent) => {
        if (this.shiftDown) {
          var elt = e.target! as HTMLElement;
          if (this.selected.includes(elt)) {
            this.selected.forEach((element) => {
              if (!element.style.position) element.style.position = "relative";
            });

            console.log("mouse down on selected elements");
            this.mouseDown = true;
            console.log(
              parseInt(this.root.contentWindow!.getComputedStyle(elt).left)
            );

            this.offset = [
              parseInt(this.root.contentWindow!.getComputedStyle(elt).left) ||
                0,
              parseInt(this.root.contentWindow!.getComputedStyle(elt).top) || 0,
            ];
            this.start = [
              e.clientX - this.offset[0],
              e.clientY - this.offset[1],
            ];
          }
        } else if (this.ctrlDown) {
          //multiselect
          this.mouseDown = true;
          this.start = [e.clientX, e.clientY];
        }
      }
    );
    this.root.contentDocument!.addEventListener(
      "mouseup",
      (event: MouseEvent) => {
        if (this.mouseDown) {
          console.log("mouse up");

          this.mouseDown = false;
          if (this.wasDragging) {
            console.log("was dragging boss");
            this.wasDragging = false;
          } else if (this.wasSelecting) {
            this.wasSelecting = false;
            //TODO: Implement Locking ( locked elts cannot be dragged, selected or styled)
            this.selected.splice(0, this.selected.length);
            this.root.contentDocument!.querySelectorAll("*").forEach((e) => {
              var elt = e as HTMLElement;

              if (
                !["body", "html"].includes(elt.tagName.toLowerCase()) &&
                elt != this.gs.getRoot()
              ) {
                const elt = e as HTMLElement;
                const rect = elt.getBoundingClientRect();
                var x = this.start[0];
                var y = this.start[1];
                var w = event.x - x;
                var h = event.y - y;

                if (w < 0 && h >= 0) {
                  // console.log("nagative width");
                  x = event.x;
                  w = -w;
                } else if (h < 0 && w >= 0) {
                  console.log("negative height");
                  y = event.y;
                  h = -h;
                } else if (w < 0 && h < 0) {
                  // console.log("nagative widht and heigth");
                  x = event.x;
                  w = -w;
                  y = event.y;
                  h = -h;
                }

                if (
                  rect.x < x + w &&
                  rect.x + rect.width > x &&
                  rect.y < y + h &&
                  rect.height + rect.y > y
                ) {
                  // console.log("detected collision");
                  this.selected.push(elt);
                }
              }
            });

            this.gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT);
          }
          this.start = [];
        }
      }
    );
    this.root.contentDocument!.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        if (this.mouseDown && this.shiftDown) {
          this.selected.forEach((elt) => {
            elt.classList.add("omo");
          });

          this.wasDragging = true;

          var delX = e.clientX - this.start[0];
          var delY = e.clientY - this.start[1];

          this.top = delY;
          this.styleParser.update(".omo", "left", delX + "px");
          this.styleParser.update(".omo", "top", delY + "px");

          this.styleSheet.innerHTML = this.styleParser.print()
            ? (this.styleParser.print() as string)
            : "";

          //TODO: cache styles before component registeration
        } else if (this.mouseDown && this.ctrlDown) {
          this.wasSelecting = true;
          this.gs.clear();
          this.gs.drawOverlay([...this.start, e.clientX, e.clientY]);
        }
      }
    );
    this.root.contentDocument!.addEventListener(
      "dragstart",
      (e: MouseEvent) => {
        if (this.shiftDown || this.ctrlDown) {
          e.stopPropagation();
          e.preventDefault();
        }
      },
      true
    );
    this.root.contentDocument!.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        if (e.shiftKey && !this.shiftDown) {
          this.shiftDown = true;
        } else if (e.ctrlKey && !this.ctrlDown) {
          this.ctrlDown = true;
          console.log("ctrl down");
        }
      }
    );
    this.root.contentDocument!.addEventListener("keyup", (e: KeyboardEvent) => {
      if (this.shiftDown && !e.shiftKey) {
        this.shiftDown = false;
      } else if (!e.ctrlKey && this.ctrlDown) {
        this.ctrlDown = false;
        console.log("ctrl up");
      }
    });
  }
}
</script>

<style scoped>
#workspace {
  border: none;
}
input {
  padding: 50px;
}
</style>
