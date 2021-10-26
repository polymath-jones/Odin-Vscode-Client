import { Space } from './shared/interfaces/space';
import { Guidespace, SELECTION_MODE, PLACEMENT_MODE } from './guidespace';
import ResizeObserver from 'resize-observer-polyfill';
import * as xmlDom from 'xmldom'
var instance: Workspace;


export enum GUIDE_DIRECTION {
    TOP, RIGHT, BOTTOM, LEFT
}

export class Workspace implements Space {

    root: HTMLIFrameElement;
    resizeObserver?: ResizeObserver;
    selected: Array<HTMLElement> = new Array();
    private dz = require("./lib/detect-zoom");


    private constructor(iframe: HTMLIFrameElement) {

        this.root = iframe;
        this.toggleAll(iframe.contentDocument!.body)
        this.registerHooks();
        this.testXmlDom();

    }
    testXmlDom() {
        var vue =
            `<template>
            <div class="hello">lasdfsdfsdfljlj</div>
            <div class="jiop">
              {{ msg }}
              <input @change="change" type="number" name="" id="in" />
          
              <iframe
                @load="loaded"
                src="/in.html"
                id="workspace"
                frameborder="0"
              ></iframe>
          
            </div>
          </template>

          `
        //todo: line 604 sax.js : invalid attribute
        let parser = xmlDom.DOMParser;
        let serializer = xmlDom.XMLSerializer;

        const templateRegex = /(<template(\s|\S)*<\/template>)/gm;
        const importRegex = /(?<=<script)(>)(\s*)(?=(\s|\S))/gm;
        const addRegex = /(?<=<script>(\s|\S)*components:(\s)*)({)(\s*)/gm;
        const remXmlns = /[\w]*xmlns(\s|\S)*?"(\s|\S)*?"/gm;

        let document = new parser().parseFromString(vue.match(templateRegex)![0], 'text/html');
        let child = new parser().parseFromString(`<divo> asfasfk </divo>`);




        let root = document.getElementsByClassName("hello").item(0);
        let elts = document.getElementsByTagNameNS('*', '*')

        for (let i = 0; i < elts.length; i++) {
            const elt = elts.item(i)
            if (elt!.tagName != 'template')
                elt!.setAttribute('od-data-id', this.generateID())
        }
        
        let sibling = root?.childNodes.item(1);
        root?.insertBefore(child, sibling!);
        let output = new serializer().serializeToString(document!);

        // source = source.replace(tempRegex, output);
        // source = source.replace(importRegex, ">\nimport MessageBox from './MessageBox';\n");
        // source = source.replace(addRegex, "{" + "MessageBox" + ",");
        output = output.replace(remXmlns, "");

        console.log(output);


    }
    copyStyle(source: HTMLElement, destination: HTMLElement) {
        const style = source.style.cssText
        destination.style.cssText = style

    }

    generateID(): string {
        let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        var gid = s4() + s4() + "_" + s4();
        return gid;
    }
    getRoot(): HTMLElement {
        return this.root;
    }

    registerHooks() {

        const iframe = this.root;
        Guidespace.init(iframe);
        var gs = Guidespace.getInstance();
        var dragging: boolean = false;
        var currentDraggable: HTMLElement | undefined;
        var currentDropZoneElt: ChildNode | HTMLElement | undefined;
        var currentPlacement: PLACEMENT_MODE | undefined;




        /**
         * Event Hooks
         */
        iframe.contentWindow?.focus();
        iframe.contentDocument?.body.setAttribute('oncontextmenu', 'return false');
        this.resizeObserver = new ResizeObserver((entries: any) => {
            console.log('window zoom level: ' + Math.round(this.getPixelRatio() * 100) + '%');
            gs.reset()
            gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)

        });
        this.resizeObserver.observe(iframe.contentDocument?.querySelector('body')!)

        iframe.contentWindow!.onscroll = (e) => {
            gs.clear()
            gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
        }

        iframe.contentDocument!.ondragstart = (e) => {

            const elt = e.target as HTMLElement;
            if (elt.getAttribute("draggable") == "true") {
                dragging = true;
                console.log('drag started');
                currentDraggable = elt
                this.toggleDropZone(currentDraggable)
                if (!this.selected.includes(elt)) {
                    this.selected.splice(0, this.selected.length)
                    this.selected.push(elt);
                }
            }
            else {
                e.preventDefault()
                e.stopPropagation()
                return false
            }
        }

        iframe.contentDocument!.onmousemove = (e) => {
            var elt = e.target as HTMLElement;
            if (!dragging) {
                gs.clear()
                gs.drawSelected([elt], SELECTION_MODE.HIGHLIGHT)
                gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
            }
        }

        iframe.contentDocument!.ondragend = (e) => {
            dragging = false;
            e.stopPropagation()
            e.preventDefault()
            gs.clear()
            this.toggleDropZone(currentDraggable!);
        }

        iframe.contentDocument!.ondrop = (e) => {
            e.stopPropagation()
            e.preventDefault()
            gs.clear()

            // const candrop = currentDropZoneContext?.hasAttribute('dropzone') && currentDropZoneElt?.parentElement?.getAttribute('dropzone') == "true"

            if ((currentDropZoneElt != undefined) && (currentPlacement != undefined)) {
                switch (currentPlacement) {
                    case PLACEMENT_MODE.BEFORE: {
                        currentDraggable?.remove()
                        currentDropZoneElt.before(currentDraggable as Node)
                        break;
                    }

                    case PLACEMENT_MODE.AFTER: {
                        currentDraggable?.remove()
                        currentDropZoneElt.after(currentDraggable as Node)
                        break;
                    }
                    case PLACEMENT_MODE.INSIDE: {
                        currentDraggable?.remove()
                        var element = currentDropZoneElt as HTMLElement
                        element.append(currentDraggable as Node)
                    }
                    case PLACEMENT_MODE.INSIDE_BEFORE: {
                        currentDraggable?.remove()
                        currentDropZoneElt.insertBefore((currentDraggable as Node), currentDropZoneElt.firstChild)
                        break;
                    }

                    case PLACEMENT_MODE.INSIDE_AFTER: {
                        currentDraggable?.remove()
                        var element = currentDropZoneElt as HTMLElement
                        element.append(currentDraggable as Node)
                        break;
                    }
                }
                currentPlacement = undefined;
                currentDropZoneElt = undefined;
            }

        }

        iframe.contentDocument!.querySelectorAll('*').forEach((e) => {
            var elt = e as HTMLElement;
            elt.ondragover = (e) => {

                var isbody = false;
                e.stopPropagation()
                e.preventDefault();

                const rect = elt.getBoundingClientRect();
                var mousePercents = this.getMousePercents(e, rect);
                const threshold = 5

                currentPlacement = undefined;
                currentDropZoneElt = undefined;

                //inside element
                if ((mousePercents.x > threshold && mousePercents.x < 100 - threshold)
                    && (mousePercents.y > threshold && mousePercents.y < 100 - threshold) && !this.validateElement(elt)) {



                    if (elt.innerHTML == "") {
                        gs.clear()
                        gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
                        gs.drawSelected([elt], SELECTION_MODE.HIGHLIGHT)
                        console.log('inside empty elt')
                        if (elt.getAttribute('dropzone') == 'true') {
                            currentDropZoneElt = elt
                            currentPlacement = PLACEMENT_MODE.INSIDE
                        }
                    }
                    else if (elt.children.length == 0) {
                        gs.clear()
                        gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
                        gs.drawSelected([elt], SELECTION_MODE.HIGHLIGHT)
                        console.log('inside text')

                        mousePercents = this.getMousePercents(e, elt.getBoundingClientRect())

                        if (mousePercents.y < 50) {

                            if (elt.getAttribute('dropzone') == 'true') {
                                currentDropZoneElt = elt
                                currentPlacement = PLACEMENT_MODE.INSIDE_BEFORE
                            }
                        }
                        else {
                            if (elt.getAttribute('dropzone') == 'true') {
                                currentDropZoneElt = elt
                                currentPlacement = PLACEMENT_MODE.INSIDE_AFTER
                            }
                        }

                    }
                    else {
                        console.log('inside full elt')
                        const closestChild = this.findClosestElement(elt, e.clientX, e.clientY)

                        mousePercents = this.getMousePercents(e, closestChild.getBoundingClientRect())
                        const display = this.getDisplayType(closestChild);
                        orientation = (display == 'inline' || display == 'inline-block')

                        if (!closestChild.isSameNode(currentDraggable!)) {
                            if (!orientation) {
                                if (mousePercents.y < 50) {
                                    gs.clear()
                                    gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
                                    gs.drawPlacement(closestChild, PLACEMENT_MODE.BEFORE)
                                    if (elt.getAttribute('dropzone') == 'true') {
                                        currentDropZoneElt = closestChild
                                        currentPlacement = PLACEMENT_MODE.BEFORE
                                    }
                                }
                                else {
                                    gs.clear()
                                    gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
                                    gs.drawPlacement(closestChild, PLACEMENT_MODE.AFTER)
                                    if (elt.getAttribute('dropzone') == 'true') {
                                        currentDropZoneElt = closestChild
                                        currentPlacement = PLACEMENT_MODE.AFTER
                                    }
                                }
                            }

                            else {
                                if (mousePercents.x < 50) {
                                    gs.clear()
                                    gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
                                    gs.drawPlacement(closestChild, PLACEMENT_MODE.BEFORE_LEFT)
                                    if (elt.getAttribute('dropzone') == 'true') {
                                        currentDropZoneElt = closestChild
                                        currentPlacement = PLACEMENT_MODE.BEFORE
                                    }
                                }
                                else {
                                    gs.clear()
                                    gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
                                    gs.drawPlacement(closestChild, PLACEMENT_MODE.AFTER_RIGHT)
                                    if (elt.getAttribute('dropzone') == 'true') {
                                        currentDropZoneElt = closestChild
                                        currentPlacement = PLACEMENT_MODE.AFTER
                                    }
                                }
                            }

                        }
                    }



                }

                //element boudaries of left and top
                else if ((mousePercents.x <= threshold) || (mousePercents.y <= threshold)) {

                    var valid
                    var orientation
                    if (mousePercents.y <= mousePercents.x) {
                        //top zone
                        valid = this.findValidParent(elt, GUIDE_DIRECTION.TOP)
                        console.log('top')
                    }
                    else {
                        //left zone
                        console.log('left')
                        valid = this.findValidParent(elt, GUIDE_DIRECTION.LEFT)
                    }

                    if (["body", "html"].includes(valid!.tagName.toLowerCase())) {
                        valid = iframe.contentDocument?.body.firstElementChild
                        isbody = true
                    }



                    //decide
                    valid = valid! as HTMLElement
                    mousePercents = this.getMousePercents(e, valid.getBoundingClientRect())
                    const display = this.getDisplayType(valid);
                    orientation = (display == 'inline' || display == 'inline-block')

                    if (!valid.isSameNode(currentDraggable!)) {
                        if (!orientation) {
                            gs.clear()
                            gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
                            gs.drawPlacement(valid, PLACEMENT_MODE.BEFORE)
                            if (isbody) {
                                currentDropZoneElt = valid
                                currentPlacement = PLACEMENT_MODE.BEFORE
                            }
                            if (elt.parentElement!.getAttribute('dropzone') == 'true') {
                                currentDropZoneElt = valid
                                currentPlacement = PLACEMENT_MODE.BEFORE
                            }
                        }

                        else {
                            gs.clear()
                            gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
                            gs.drawPlacement(valid, PLACEMENT_MODE.BEFORE_LEFT);
                            if (isbody) {
                                currentDropZoneElt = valid
                                currentPlacement = PLACEMENT_MODE.BEFORE
                            }
                            if (elt.parentElement!.getAttribute('dropzone') == 'true') {
                                currentDropZoneElt = valid
                                currentPlacement = PLACEMENT_MODE.BEFORE
                            }
                        }

                    }
                }

                //element boudaries of right and bottom
                else if ((mousePercents.x >= 100 - threshold) || (mousePercents.y >= 100 - threshold)) {
                    var valid
                    if (mousePercents.y >= mousePercents.x) {
                        valid = this.findValidParent(elt, GUIDE_DIRECTION.BOTTOM)
                        console.log('bottom')
                    }
                    else {
                        valid = this.findValidParent(elt, GUIDE_DIRECTION.RIGHT)
                        console.log('right')
                    }
                    if (["body", "html"].includes(valid!.tagName.toLowerCase())) {
                        valid = iframe.contentDocument?.body.lastElementChild;
                        isbody = true;
                    }

                    //decide
                    valid = valid! as HTMLElement
                    mousePercents = this.getMousePercents(e, valid.getBoundingClientRect())
                    const display = this.getDisplayType(valid);
                    orientation = (display == 'inline' || display == 'inline-block')

                    if (!valid.isSameNode(currentDraggable!)) {
                        //horizontal
                        if (!orientation) {
                            gs.clear()
                            gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
                            gs.drawPlacement(valid, PLACEMENT_MODE.AFTER)
                            if (isbody) {
                                currentDropZoneElt = valid
                                currentPlacement = PLACEMENT_MODE.AFTER
                            }
                            else if (elt.parentElement!.getAttribute('dropzone') == 'true') {
                                currentDropZoneElt = valid
                                currentPlacement = PLACEMENT_MODE.AFTER
                            }
                        }
                        else {
                            gs.clear()
                            gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT)
                            gs.drawPlacement(valid, PLACEMENT_MODE.AFTER_RIGHT)
                            if (isbody) {
                                currentDropZoneElt = valid
                                currentPlacement = PLACEMENT_MODE.AFTER
                            }
                            else if (elt.parentElement!.getAttribute('dropzone') == 'true') {
                                currentDropZoneElt = valid
                                currentPlacement = PLACEMENT_MODE.AFTER
                            }
                        }
                    }
                }


            }
        });

        document.ondragstart = (e) => {
            currentDraggable = e.target as HTMLElement;
            dragging = false;
        }

    }

    static init(window: HTMLIFrameElement) {
        if (!instance)
            instance = new Workspace(window);
        else
            instance = new Workspace(window);
    }

    static getInstance(): Workspace {
        if (instance != undefined) {
            console.log('Returning same instance');
            return instance
        }
        else
            throw Error('Workspace not instantiated');
    }

    private calculateDistance(x: number, y: number, mouseX: number, mouseY: number): number {
        return Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));
    }

    private getPixelRatio() {
        return this.dz.device() / this.dz.zoom();
    }

    private validateElement(elt: HTMLElement): boolean {
        const voidelements = ['i', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'video', 'iframe', 'source', 'track', 'wbr'];
        return voidelements.includes(elt.tagName.toLocaleLowerCase());
    }

    private findValidParent(elt: HTMLElement, direction: GUIDE_DIRECTION): HTMLElement {
        switch (direction) {
            case GUIDE_DIRECTION.TOP: {
                return elt
            }


            case GUIDE_DIRECTION.RIGHT: {
                const parent = elt.parentElement;
                const rect = elt.getBoundingClientRect();
                const rectParent = parent?.getBoundingClientRect();

                if (["body", "html"].includes(elt!.tagName.toLowerCase()))
                    return elt
                else if (Math.abs(rectParent!.right - rect.right) == 0)
                    return parent!
                else
                    return elt
            }

            case GUIDE_DIRECTION.BOTTOM: {
                return elt
            }

            case GUIDE_DIRECTION.LEFT: {
                const parent = elt.parentElement;
                const rect = elt.getBoundingClientRect();
                const rectParent = parent?.getBoundingClientRect();

                if (["body", "html"].includes(elt!.tagName.toLowerCase()))
                    return elt
                else if (Math.abs(rectParent!.left - rect.left) == 0)
                    return parent!
                else
                    return elt
            }

        }
    }

    private getMousePercents(e: MouseEvent, rect: DOMRect) {

        const posPercentX = ((e.x - rect.left) / (rect.right - rect.left)) * 100;
        const posPercentY = ((e.y - rect.top) / (rect.bottom - rect.top)) * 100;

        return { x: posPercentX, y: posPercentY }
    }

    private getDisplayType(element: HTMLElement): string {
        var cStyle = this.root.contentWindow!.getComputedStyle(element, "");
        return cStyle.display;
    }

    private findClosestElement(elt: HTMLElement, clientX: number, clientY: number): HTMLElement {
        const children = Array.from(elt.children);
        var closestElt: HTMLElement | undefined = undefined;
        var closetDistance: number = 0
        children.forEach((child) => {

            var rect = child.getBoundingClientRect();
            var distance = 0;
            var distance1, distance2 = null;
            var x0 = rect.left;
            var x2 = rect.right;
            var y1 = rect.top;
            var y2 = rect.bottom;
            var corner1 = null;
            var corner2 = null;

            if (clientY > y1 && clientY < y2) {
                if (clientX < x0 && clientY < x2) {
                    corner1 = { x: x0, y: clientY };
                }
                else {
                    corner1 = { x: x2, y: clientY, };
                }
            }

            else if (clientX > x0 && clientX < x2) {
                if (clientY < y1 && clientY < y2) {
                    corner1 = { x: clientX, y: y1, };
                }
                else {
                    corner1 = { x: clientX, y: y2, };
                }
            }
            else {

                if (clientX < x0 && clientX < x2) {
                    corner1 = { x: x0, y: y1, };
                    corner2 = { x: x0, y: y2, };
                }
                else if (clientX > x0 && clientX > x2) {

                    corner1 = { x: x2, y: y1, };
                    corner2 = { x: x2, y: y2, };
                }
                else if (clientY < y1 && clientY < y2) {

                    corner1 = { x: x0, y: y1, };
                    corner2 = { x: x2, y: y1, };
                }
                else if (clientY > y1 && clientY > y2) {

                    corner1 = { x: x0, y: y2, };
                    corner2 = { x: x2, y: y2, }
                }
            }

            distance1 = this.calculateDistance(corner1!.x, corner1!.y, clientX, clientY);
            if (corner2 !== null)
                distance2 = this.calculateDistance(corner2.x, corner2.y, clientX, clientY);

            if (distance1 < distance2! || distance2 === null) {
                distance = distance1;
            }
            else {
                distance = distance2;
            }
            if (closestElt != undefined) {
                if (closetDistance < distance) {
                    return true;
                }
            }
            closestElt = child as HTMLElement
            closetDistance = distance
        })

        return closestElt!;

    }

    private toggleDropZone(elt: HTMLElement) {
        elt.querySelectorAll("*").forEach((e) => {
            if (e.hasAttribute("dropzone")) {
                if (e.getAttribute("dropzone") == "true")
                    e.setAttribute("dropzone", "toggled-false")
                else if (e.getAttribute("dropzone") == "toggled-false")
                    e.setAttribute("dropzone", "true")
            }
        })

        if (elt.hasAttribute("dropzone")) {
            if (elt.getAttribute("dropzone") == "true")
                elt.setAttribute("dropzone", "toggled-false")
            else if (elt.getAttribute("dropzone") == "toggled-false")
                elt.setAttribute("dropzone", "true")
        }
    }

    private toggleDraggable(elt: HTMLElement) {
        elt.querySelectorAll("*").forEach((e) => {
            if (e.hasAttribute("draggable")) {
                if (e.getAttribute("draggable") == "true")
                    e.setAttribute("draggable", "toggled-false")
                else if (e.getAttribute("draggable") == "toggled-false")
                    e.setAttribute("draggable", "true")
            }
        })

        if (elt.hasAttribute("draggable")) {
            if (elt.getAttribute("draggable") == "true")
                elt.setAttribute("draggable", "toggled-false")
            else if (elt.getAttribute("draggable") == "toggled-false")
                elt.setAttribute("draggable", "true")
        }
    }

    private toggleAll(elt: HTMLElement) {
        elt.querySelectorAll("*").forEach((e) => {
            e.setAttribute("dropzone", "true")
            e.setAttribute("draggable", "true")
        })

    }

}
