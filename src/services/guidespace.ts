import { Space } from './shared/interfaces/space';


var instance: Guidespace;
export enum SELECTION_MODE {
    HIGHLIGHT, MULTISELECT
}
export enum PLACEMENT_MODE {
    BEFORE, AFTER, BEFORE_LEFT, AFTER_RIGHT, INSIDE, INSIDE_BEFORE, INSIDE_AFTER
}


export class Guidespace implements Space {


    root: HTMLIFrameElement;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;



    private constructor(iframe: HTMLIFrameElement) {
        this.root = iframe;
        this.canvas = <HTMLCanvasElement>iframe.contentDocument?.createElement("canvas")
        this.canvas.setAttribute('style', this.getCanvasStyle());
        this.canvas.width = iframe.contentDocument!.documentElement.clientWidth;
        this.canvas.height = iframe.contentDocument!.documentElement.clientHeight;
        this.context = this.canvas.getContext("2d")!;
        iframe.contentDocument?.body.append(this.canvas);
    }
    drawOverlay(box: Array<number>) {
        if (box.length == 4) {
            this.context.strokeStyle = "#ffff0f";
            this.context.fillStyle = "#ffff0f";
            const offset = 0.5;
            this.context.lineWidth = 1;
            const x = Math.floor(box[0]) + offset
            const y = Math.floor(box[1]) + offset
            const w = Math.floor(box[2] - box[0])
            const h = Math.floor(box[3] - box[1])
            this.context.strokeRect(x, y, w, h)
            this.context.globalAlpha = 0.1
            this.context.fillRect(box[0], box[1], w, h)
            this.context.globalAlpha = 1.0

        }
    }
    drawPlacement(elt: HTMLElement, placementMode: PLACEMENT_MODE) {

        if (["body", "html"].includes(elt!.tagName.toLowerCase()))
            this.drawContext(elt)
        else
            this.drawContext(elt.parentElement!)
        const offset = 0.5;
        this.context.strokeStyle = "#178df7";

        this.context.lineWidth = 1;

        const rect = elt.getBoundingClientRect();
        const x = Math.floor(rect.x) + offset;
        const y = Math.floor(rect.y) + offset;
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);


        switch (placementMode) {
            case PLACEMENT_MODE.BEFORE: {
                this.context.beginPath()
                this.context.moveTo(x, y);
                this.context.lineTo(x + w, y);
                this.context.stroke();
                break;
            }
            case PLACEMENT_MODE.AFTER: {

                this.context.beginPath()
                this.context.moveTo(x, y + h);
                this.context.lineTo(x + w, y + h);
                this.context.stroke();
                break;
            }
            case PLACEMENT_MODE.BEFORE_LEFT: {
                this.context.beginPath()
                this.context.moveTo(x, y);
                this.context.lineTo(x, y + h);
                this.context.stroke();
                break;
            }

            case PLACEMENT_MODE.AFTER_RIGHT: {
                this.context.beginPath()
                this.context.moveTo(x + w, y);
                this.context.lineTo(x + w, y + h);
                this.context.stroke();
                break;
            }

        }

    }
    getRoot(): HTMLElement {
        return this.canvas;
    }
    drawSelected(elts: Array<HTMLElement>, mode: SELECTION_MODE) {
        switch (mode) {
            case SELECTION_MODE.HIGHLIGHT: {
                const offset = 0.5;
                const elt = elts[0];

                this.context.strokeStyle = "#178df7";
                this.context.lineWidth = 1;

                const rect = elt.getBoundingClientRect();

                const x = Math.floor(rect.x) + offset;
                const y = Math.floor(rect.y) + offset;
                const w = Math.floor(rect.width);
                const h = Math.floor(rect.height);
                this.context.strokeRect(x, y, w, h)
                break;
            }

            case SELECTION_MODE.MULTISELECT: {

                if (elts.length != 0) {
                    elts.forEach(elt => {
                        this.context.beginPath();
                        const offset = 0;
                        this.context.strokeStyle = "#178df7";
                        this.context.lineWidth = 2;

                        const rect = elt.getBoundingClientRect();
                        const x = Math.floor(rect.x) + offset;
                        const y = Math.floor(rect.y) + offset;
                        const w = Math.floor(rect.width);
                        const h = Math.floor(rect.height);
                        this.context.strokeRect(x, y, w, h);

                    })
                }



                break;
            }
        }
    }

    drawContext(elt: HTMLElement) {

        const offset = 0;
        this.context.strokeStyle = "#17f787";
        this.context.lineWidth = 2;

        const rect = elt.getBoundingClientRect();

        const x = Math.floor(rect.x) + offset;
        const y = Math.floor(rect.y) + offset;
        const w = Math.floor(rect.width);
        const h = Math.floor(rect.height);
        this.context.strokeRect(x, y, w, h)

    }


    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    recalibrate() {
        this.canvas.width = this.root.contentDocument!.documentElement.clientWidth;
        this.canvas.height = this.root.contentDocument!.documentElement.clientHeight;
    }
    reset() {
        this.recalibrate();
        this.clear()
    }


    private getCanvasStyle(): string {
        return `
        position:fixed;
        z-index: 999999;
        pointer-events: none;
        top:0;
        left:0;
        width: 100%; 
        height: 100%; 
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-crisp-edges;
        image-rendering: pixelated;
        image-rendering: crisp-edges;`
    }
    static init(window: HTMLIFrameElement) {
        if (!instance)
            instance = new Guidespace(window);
        else {
            console.log('Reattaching new Guidespace Instance');
            instance = new Guidespace(window);
        }
    }

    static getInstance(): Guidespace {
        if (instance != undefined) {
            console.log('returning same instance');
            return instance
        }
        else
            throw Error('Guidespace not instantiated');
    }
}
