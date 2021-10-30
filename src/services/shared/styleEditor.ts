/**
 * connected to the state objects in the state service
 * holds reference to the style canvas element
 * exposes functions to edit the state and update the view
 */

import { StyleParser } from "../lib/styleParser";

export namespace StyleEditors {


    export function changeColor(color: string, styleSheet: HTMLStyleElement, styleParser: StyleParser) {
        
        styleParser.update(
            ".omo",
            "background-color",
            color + " !important"
        );

        if (styleSheet)
            styleSheet.innerHTML = styleParser.print() ? (styleParser.print() as string) : "";
    }
}