
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
        this.styleParser = new StyleParser(`

        

        html, body {
            border: 0px;
            margin: 0px;
            padding: 0px;
        }
        body{
            background-color: #57575B;
        }
        body::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.123);
            background-color: #84828E;
        }

        body::-webkit-scrollbar {
            width: 8px;
            background-color: #84828E;
        }

        body::-webkit-scrollbar-thumb {
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.205);
            background-color: #313133;
        }


        @media screen and (max-width: 1200px) {
          
        }
        @media screen and (max-width: 825px) {
          
        }
        @media screen and (max-width: 768px) {
          
        }
        @media screen and (max-width: 425px) {
          .go{
              color: blue !important;
              display: inline;
          }
        }

        `)

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


