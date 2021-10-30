import { PLACEMENT_MODE } from "../guidespace"
export namespace TemplateEditors {
    
    export function createInDOm(relative: HTMLElement | ChildNode, native: string, mode: PLACEMENT_MODE) {

        var div = document.createElement('div');
        div.innerHTML = native.trim();
        var element = div.firstChild as HTMLElement;

        switch (mode) {
            case PLACEMENT_MODE.BEFORE: {

                var elt = element?.cloneNode(true)
                relative.before(elt!)

                break;
            }

            case PLACEMENT_MODE.AFTER: {

                var elt = element?.cloneNode(true)
                relative.after(elt!)

                break;
            }
            case PLACEMENT_MODE.INSIDE: {

                var elt = element?.cloneNode(true)
                var element = relative as HTMLElement
                element.append(elt!)

                break

            }
            case PLACEMENT_MODE.INSIDE_BEFORE: {

                var elt = element?.cloneNode(true)
                relative.insertBefore(elt!, relative.firstChild)


                break;
            }

            case PLACEMENT_MODE.INSIDE_AFTER: {

                var elt = element?.cloneNode(true)
                var element = relative as HTMLElement
                element.append(elt!)


                break;
            }
        }
    }

    export function deleteInDOM(element: HTMLElement) {
        element.remove()
    }
    export function placeInDOM(relative: HTMLElement | ChildNode, source: HTMLElement, mode: PLACEMENT_MODE, duplicate: Boolean) {
        switch (mode) {
            case PLACEMENT_MODE.BEFORE: {
                if (!duplicate) {

                    source?.remove()
                    relative.before(source as Node)
                }
                else {
                    relative.before(source!)
                }
                break;
            }

            case PLACEMENT_MODE.AFTER: {
                if (!duplicate) {
                    source?.remove()
                    relative.after(source as Node)
                } else {
                    relative.after(source!)
                }
                break;
            }
            case PLACEMENT_MODE.INSIDE: {
                if (!duplicate) {
                    source?.remove()
                    var rel = relative as HTMLElement
                    rel.append(source as Node)
                } else {
                   
                    var rel = relative as HTMLElement
                    rel.append(source!)
                }
                break

            }
            case PLACEMENT_MODE.INSIDE_BEFORE: {
                if (!duplicate) {

                    source?.remove()
                    relative.insertBefore((source as Node), relative.firstChild)

                }
                else {
                    
                    relative.insertBefore(source!, relative.firstChild)

                }
                break;
            }

            case PLACEMENT_MODE.INSIDE_AFTER: {
                if (!duplicate) {
                  
                    source?.remove()
                    var rel = relative as HTMLElement
                    rel.append(source as Node)

                } else {
                    
                    var rel = relative as HTMLElement
                    rel.append(source!)

                }
                break;
            }
        }
    }
}