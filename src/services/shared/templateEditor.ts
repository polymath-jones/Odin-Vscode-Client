import { PLACEMENT_MODE } from "../guidespace"
import { Workspace } from "../workspace";
import { StateService } from "./stateService";
export namespace TemplateEditors {

    export function createInDOm(relative: HTMLElement | ChildNode, native: string, mode: PLACEMENT_MODE): HTMLElement {

        var div = document.createElement('div');
        div.innerHTML = native.trim();
        var element = div.firstChild as HTMLElement;
        element.setAttribute("odin-id", Workspace.getInstance().generateID());

        const doc = StateService.getInstance().getTemplateParser().getDocument()
        const tempRelative = getTemplateElement(doc, relative as HTMLElement)

        console.log(tempRelative);
        switch (mode) {
            case PLACEMENT_MODE.BEFORE: {

                var elt = element?.cloneNode(true)
                var tempElt = element?.cloneNode(true)
                relative.before(elt!)
                tempRelative?.before(tempElt!)
                element = elt as HTMLElement

                break;
            }

            case PLACEMENT_MODE.AFTER: {

                var elt = element?.cloneNode(true)
                var tempElt = element?.cloneNode(true)

                relative.after(elt!)
                tempRelative?.after(tempElt!)
                element = elt as HTMLElement

                break;
            }
            case PLACEMENT_MODE.INSIDE: {

                var elt = element?.cloneNode(true)
                var tempElt = element?.cloneNode(true)

                var rel = relative as HTMLElement
                rel.append(elt!)

                tempRelative?.append(tempElt)
                element = elt as HTMLElement

                break

            }
            case PLACEMENT_MODE.INSIDE_BEFORE: {

                var elt = element?.cloneNode(true)
                var tempElt = element?.cloneNode(true)

                relative.insertBefore(elt!, relative.firstChild)
                tempRelative?.insertBefore(tempElt, tempRelative.firstChild)
                element = elt as HTMLElement

                break;
            }

            case PLACEMENT_MODE.INSIDE_AFTER: {

                var elt = element?.cloneNode(true)
                var tempElt = element?.cloneNode(true)

                var rel = relative as HTMLElement
                rel.append(elt!)
                tempRelative?.append(tempElt)
                element = elt as HTMLElement

                break;
            }
        }
        return element

    }
    export function deleteInDOM(element: HTMLElement) {
        const doc = StateService.getInstance().getTemplateParser().getDocument()
        const tempSource = getTemplateElement(doc, element as HTMLElement)
        element.remove()
        tempSource?.remove()
    }
    export function placeInDOM(relative: HTMLElement | ChildNode, source: HTMLElement, mode: PLACEMENT_MODE, duplicate: Boolean) {

        const doc = StateService.getInstance().getTemplateParser().getDocument()
        const tempRelative = getTemplateElement(doc, relative as HTMLElement)
        const tempSource = getTemplateElement(doc, source as HTMLElement)


        switch (mode) {
            case PLACEMENT_MODE.BEFORE: {
                if (!duplicate) {

                    source?.remove()
                    relative.before(source!)

                    tempSource?.remove()
                    tempRelative?.before(tempSource!)
                }
                else {
                    relative.before(source!)
                    tempRelative?.before(tempSource!)
                }
                break;
            }

            case PLACEMENT_MODE.AFTER: {
                if (!duplicate) {
                    source?.remove()
                    relative.after(source!)

                    tempSource?.remove()
                    tempRelative?.after(tempSource!)

                } else {
                    relative.after(source!)
                    tempRelative?.after(tempSource!)

                }
                break;
            }
            case PLACEMENT_MODE.INSIDE: {
                if (!duplicate) {
                    source?.remove()
                    var rel = relative as HTMLElement
                    rel.append(source as Node)

                    tempSource?.remove()
                    tempRelative?.append(tempSource!)

                } else {

                    var rel = relative as HTMLElement
                    rel.append(source!)
                    tempRelative?.append(tempSource!)
                }
                break

            }
            case PLACEMENT_MODE.INSIDE_BEFORE: {
                if (!duplicate) {

                    source?.remove()
                    relative.insertBefore((source as Node), relative.firstChild)

                    tempSource?.remove()
                    tempRelative?.insertBefore(tempSource!, tempRelative.firstChild)

                }
                else {

                    relative.insertBefore(source!, relative.firstChild)
                    tempRelative?.insertBefore(tempSource!, tempRelative.firstChild)

                }
                break;
            }

            case PLACEMENT_MODE.INSIDE_AFTER: {
                if (!duplicate) {

                    source?.remove()
                    var rel = relative as HTMLElement
                    rel.append(source as Node)

                    tempSource?.remove()
                    tempRelative?.append(tempSource!)

                } else {

                    var rel = relative as HTMLElement
                    rel.append(source!)

                    tempRelative?.append(tempSource!)
                }
                break;
            }

        }
    }


    // get element from ast
    export function getTemplateElement(doc: Document, elt: HTMLElement): HTMLElement | null {

        let elementF!: HTMLElement | null;

        let id = elt.getAttribute("odin-component");
        let element = doc.querySelector(`[odin-component="${id}"]`) as (HTMLElement | null)
        elementF = element

        if (!element) {
            let id = elt.getAttribute("odin-id");
            let element = doc.querySelector(`[odin-id="${id}"]`) as (HTMLElement | null)
            elementF = element
        }

        return elementF

    }
}