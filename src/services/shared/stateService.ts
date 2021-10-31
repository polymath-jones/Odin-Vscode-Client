
/** 
 * TEMPLATE state (xmldom) STYLE state (ccsom) SCRIPT state (ts-morph)--- instantiated after document load
 * Provides helper functions for editing states and getting state data ( like attributes and directives )
 * Can send current state which parsed from all asts to through the socket server
 * Can recieve new state or can be updated
 * 
 * */

import { StyleParser } from "../lib/styleParser";
import * as xmlDom from 'xmldom';
import { ScriptParser } from "../lib/scriptParser";

var instance: StateService;

//depends on no services
export class StateService {

    private styleParser!: StyleParser;
    private xmlParser!: xmlDom.DOMParser;
    private scriptParser!: ScriptParser;


    private constructor(componentSource: string) {
        this.deconstruct(componentSource);

    }

    static init(componentSource: string) {
        instance = new StateService(componentSource)
    }
    update(componentSource: string) {
        //override old states for new component scope
        this.deconstruct(componentSource)
    }
    save() {
        //parse asts and call emitters
    }
    deconstruct(src: string) {
        this.styleParser = new StyleParser('')
        this.styleParser.create(
            undefined,
            ".omo",
            `{ 
          position:relative;
          top:initial; 
          left:initial;
          background-color: initial;
        }`
        );


    }
    getStyleParser(): StyleParser {
        return this.styleParser;
    }
    getXmlParser(): DOMParser {
        return this.xmlParser
    }
    getScriptParser(): ScriptParser {
        return this.scriptParser;
    }
    static getInstance() {
        return instance;
    }
}


