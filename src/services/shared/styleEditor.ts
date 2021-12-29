/**
 * connected to the state objects in the state service
 * holds reference to the style canvas element
 * exposes functions to edit the state and update the view
 */

import { StyleParser } from "../lib/styleParser";

export namespace StyleEditors {


    export function updateDeclaration(params: { rule: string, declaration: string, value?: string, precedence: boolean }, styleSheet: HTMLStyleElement, styleParser: StyleParser, mediaPrelude?: string) {

        //if declaration does not exist create else update
        params.precedence = true;
        let priority = params.precedence ? " !important" : ""
        if (!mediaPrelude) {
            if (params.value) styleParser.update(params.rule, params.declaration, `${params.value}${priority}`);
        } else {                            
            if (params.value) styleParser.update(params.rule, params.declaration, `${params.value}${priority}`,mediaPrelude);
        }

        if (styleSheet) styleSheet.innerHTML = styleParser.print() ? (styleParser.print() as string) : "";

    }

    export function createDeclaration(params: { rule: string, declaration: string, value?: string, precedence: boolean }, styleSheet: HTMLStyleElement, styleParser: StyleParser, mediaPrelude?: string) {

        params.precedence = true;
        let priority = params.precedence ? " !important" : ""
        if (!mediaPrelude) {
            styleParser.create(params.rule, undefined, `{${params.declaration}:${params.value}${priority};}`)
        }
        else{
            
            styleParser.create(params.rule, undefined, `{${params.declaration}:${params.value}${priority};}`,mediaPrelude)
            
        }

        if (styleSheet) styleSheet.innerHTML = styleParser.print() ? (styleParser.print() as string) : "";

    }

    export function removeDeclaration(params: { rule: string, declaration: string }, styleSheet: HTMLStyleElement, styleParser: StyleParser, mediaPrelude?: string) {
        if (!mediaPrelude)
            styleParser.delete(params.rule, undefined, params.declaration)
        else
        styleParser.delete(params.rule, undefined, params.declaration,mediaPrelude)

            if (styleSheet) styleSheet.innerHTML = styleParser.print() ? (styleParser.print() as string) : "";
    }


    /* this.styleParser.create(
        undefined,
        ".omo",
        `{ 
      position:relative;
      top:initial; 
      left:initial;
      background-color: initial;
    }`
    ); */

}