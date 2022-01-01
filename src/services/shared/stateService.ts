
/** 
 * TEMPLATE state (xmldom) STYLE state (ccsom) SCRIPT state (ts-morph)--- instantiated after document load
 * Provides helper functions for editing states and getting state data ( like attributes and directives )
 * Can send current state which parsed from all asts to through the socket server
 * Can recieve new state or can be updated
 * 
 * */

import { StyleParser } from "../lib/styleParser";
import { ScriptParser } from "../lib/scriptParser";
import { TemplateParser } from "../lib/templateParser";
import store from "@/store";
import { ThisTypeNode } from "ts-morph";

var instance: StateService;
const templateBlockRegex = /(?<=<template[\s\S]*>)[\s\S]*(?=(<\/template))/gm;
const scriptBlockRegex = /(?<=<script[\s\S]*>)[\s\S]*(?=(<\/script))/gm;
const styleBlockRegex = /(?<=<style[\s\S]*>)[\s\S]*(?=(<\/style))/gm;
const preludeRegex = /(?<=\/\*[\s\S]*ODIN)[\s\S]*(?=(\*\/))/g;
const remXmlns = /[\w]*xmlns(\s|\S)*?"(\s|\S)*?"/gm;


//depends on no services
export class StateService {

    private styleParser!: StyleParser;
    private templateParser!: TemplateParser;
    private scriptParser!: ScriptParser;

    private constructor() {

         this.getRoot()
        //this.deconstruct("")

    }
    async getRoot() {
        let src: string | undefined = undefined;
        let response = await fetch(`http://localhost:3333/root`);


        if (response.ok) {
            let json = await response.json()
            src = json.source;
        } else {
            throw new Error("Connection failed");
        }

        this.deconstruct(src!)
    }

    async getScope(id: string) {
        let src: string | undefined = undefined;
        let response = await fetch(`http://localhost:3333/component/${id}`);


        if (response.ok) {
            let json = await response.json()
            src = json.source;
        } else {
            throw new Error("Connection failed");
        }

        this.deconstruct(src!)
    }

    updateScope(root?: boolean) {

        if (!root) {
            this.getScope(store.state.currentScope)
        } else {
            this.getRoot()
        }
    }

    async save() {
        let template = this.templateParser.print()
        let script = this.scriptParser.print()
        let style = this.styleParser.print()

        let component =
            `
            <template> 
            ${template}
            </template>
            
            <script lang="ts">
            ${script}
            </script>

            <style scoped>
            ${style}
            </style>
        `;
        const formatter = require("prettier/standalone");
        const plugins = require("prettier/parser-html");

        component = formatter.format(component, {
            parser: "html",
            plugins,
        });

        let data = {
            source: component,
            id: store.state.currentScope
        }

        let response = await fetch('http://localhost:3333/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        if (response.ok) {
            console.log(response);

        } else {
            throw new Error("Connection failed");
        }


        console.log(component)
    }
    deconstruct(src: string) {

        const preludes = `

    /*---------  ODIN RESPONSIVE QUERIES   ---------*/                         
        
        @media screen and (max-width: 1200px){}
        @media screen and (max-width: 825px) {}
        @media screen and (max-width: 768px) {}
        @media screen and (max-width: 425px) {}

        `

        const template = `
        <section>
            <Dig v-bind:="on"></Dig>
        </section>
        `

        const templateMatches = src.match(templateBlockRegex);
        const scriptMatches = src.match(scriptBlockRegex);
        const styleMatches = src.match(styleBlockRegex);

        let templateBlock = templateMatches ? templateMatches[0] : "<div></div>"
        let scriptBlock = scriptMatches ? scriptMatches[0] : "//empty script"
        let styleBlock = styleMatches ? styleMatches[0] : preludes

        let addPrelude = styleBlock.match(preludeRegex) == null
        styleBlock = addPrelude ? styleBlock + preludes : styleBlock

        this.templateParser = new TemplateParser(templateBlock)
        this.styleParser = new StyleParser(styleBlock)
        this.scriptParser = new ScriptParser(scriptBlock)

        // this.templateParser = new TemplateParser(template)
        // this.styleParser = new StyleParser(preludes)
        // this.scriptParser = new ScriptParser('console.log("script parser!!!")')

    }
    getStyleParser(): StyleParser {
        return this.styleParser;
    }
    getTemplateParser(): TemplateParser {
        return this.templateParser
    }
    getScriptParser(): ScriptParser {
        return this.scriptParser;
    }

    static init() {
        instance = new StateService()
    }
    static getInstance() {
        return instance;
    }
}


