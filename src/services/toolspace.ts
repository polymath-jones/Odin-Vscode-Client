
/**
 * Static & dynamic element / component loading, handler functions for Toolspace UI events
 * Utilizes the emiiter and controllers service
 * Objects: stylesheet, parser, workspace, guidespace.
 * Styling events are create, update and delete
 */

import { Space } from "./shared/interfaces/space";
import { StyleEditors } from "../services/shared/styleEditor";
import { StateService } from "../services/shared/stateService";
import { HistoryService, OPERTATION_MODE, OPERTATION_TYPE, State } from "../services/shared/historyService";
import { Guidespace, SELECTION_MODE } from "../services/guidespace";
import store from "@/store";


var instance: Toolspace;

export enum PRELUDES {
    MOBILE, LANDSCAPE, TABLET, DESKTOP, LARGE
}

export class Toolspace implements Space {

    root: HTMLIFrameElement;
    selected?: Array<HTMLElement>
    styleSheet: HTMLStyleElement;
    stateService: StateService;
    selectedClasses!: Array<string>;
    mediaSelectedClasses!: Array<string>;
    historyService: HistoryService;
    preludes = new Map<PRELUDES, string>()
    currentPrelude: string | undefined = undefined

    private constructor(iframe: HTMLIFrameElement, styleSheet: HTMLStyleElement) {
        this.root = iframe
        this.styleSheet = styleSheet
        this.stateService = StateService.getInstance()
        this.historyService = HistoryService.getInstance()
        this.preludes.set(PRELUDES.MOBILE, "screen and (max-width: 425px)")
        this.preludes.set(PRELUDES.LANDSCAPE, "screen and (max-width: 825px)")
        this.preludes.set(PRELUDES.TABLET, "screen and (max-width: 768px)")
        this.preludes.set(PRELUDES.DESKTOP, "screen and (max-width: 1200px)")
        this.preludes.set(PRELUDES.LARGE, "screen and (max-width: 1440px)")

    }
    checkIfMedia() {
        const max = store.state.viewData.windowConstriants.max
        if (max <= 425)
            this.currentPrelude = this.preludes.get(PRELUDES.MOBILE)
        else if (max <= 768)
            this.currentPrelude = this.preludes.get(PRELUDES.TABLET)
        else if (max <= 825)
            this.currentPrelude = this.preludes.get(PRELUDES.LANDSCAPE)
        else if (max <= 1200)
            this.currentPrelude = this.preludes.get(PRELUDES.DESKTOP)
        else
            this.currentPrelude = undefined
    }

    getRoot(): HTMLElement {
        return this.root
    }

    setSelected(selected: Array<HTMLElement>) {

        this.checkIfMedia()

        //check if first element has app class
        this.selected = selected;
        const classList = new Array<string>()
        const currentElt = selected[0]
        const styleRules = this.stateService.getStyleParser().get(false, undefined, undefined) as Array<string>
        const mediaStyleRules = this.stateService.getStyleParser().get(false, undefined, undefined, this.currentPrelude) as Array<string>
        const selectedClasses = new Array<string>()
        const mediaSelectedClasses = new Array<string>()

        /* 
        todo:: 
        add empty rule to default style if styling is reponsive directly. 
        Check if current class selected class is in media selected classes. Create if it isn't else update
         */

        if (currentElt)
            classList.push(...currentElt.classList)

        classList.forEach(val => {

            if (styleRules.includes(`.${val}`)) {
                selectedClasses.push(val)
            }
            if (mediaStyleRules.includes(`.${val}`)) {
                mediaSelectedClasses.push(val)
            }

        })
        this.selected = selected
        this.selectedClasses = selectedClasses
        this.mediaSelectedClasses = mediaSelectedClasses
        this.updateUIState()
        //console.log(selectedClasses,selected[0]);

    }
    /** 
     * @updateUIstate updates the global state of current class style object for tool reactivity
     * */
    updateUIState() {

        //todo to be gotten from some place through exports
        let state = {
            "display": undefined,
            "flex-basis": undefined,
            "flex-direction": undefined,
            "flex-grow": undefined,
            "flex-shrink": undefined,
            "flex-wrap": undefined,
            "float": undefined,
        }
        const rule = `.${this.selectedClasses[this.selectedClasses.length - 1]}`.trim()
        const parser = this.stateService.getStyleParser()
        let entries = Object.entries(state);

        //get corresponding state value from parser and replace
        let mappedEntries = entries.map(entry => {
            const value = parser.get(false, rule, entry[0], this.currentPrelude);
            //console.log(value,rule,entry[0]);
            const newEntry = [entry[0], value]
            return newEntry
        });

        let mappedState = Object.fromEntries(mappedEntries);
        store.commit('setData', mappedState)

    }
    checkLocked(elt: HTMLElement): boolean {
        if (elt.hasAttribute('odin-locked'))
            if (elt.getAttribute('odin-locked') == 'true')
                return true;
            else
                return false
        else
            return false
    }
    updateStyle(data: { declartion: string, value: string, precedence: boolean }) {

        this.checkIfMedia()
        console.log(this.selectedClasses);


        let gs = Guidespace.getInstance()
        let styleParser = this.stateService.getStyleParser()

        if (this.selected && !this.checkLocked(this.selected[0])) {

            if (this.currentPrelude) {
                if (this.selectedClasses.length == 0) {
                    //generate new class
                    const className = this.selected[0].tagName.toLowerCase() + "-" + this.generateID();
                    this.selectedClasses.push(className);

                    this.stateService.getStyleParser().create(undefined, `.${className}`, undefined, this.currentPrelude);

                    if (this.selected.length == 1) {
                        this.selected[0].classList.add(className);
                    }
                    else if (this.selected.length > 1) {
                        this.selected.forEach((elt) => elt.classList.add(className));
                    }

                }
                else if (this.selectedClasses.length == 0 && this.selected.length > 1) {

                    const className = this.selected[0].tagName.toLowerCase() + "-" + this.generateID();
                    this.selectedClasses.push(className);
                    this.stateService.getStyleParser().create(undefined, `.${className}`, undefined, this.currentPrelude);
                    this.selected.forEach((elt) => elt.classList.add(className));
                }

               /*  if(this.selectedClasses.length ==0 && this.mediaSelectedClasses.length ==0){
                    const className = this.selected[0].tagName.toLowerCase() + "-" + this.generateID();
                    this.selectedClasses.push(className);
                    this.mediaSelectedClasses.push(className);

                } */



            }




            let params = {
                rule: `.${this.selectedClasses[this.selectedClasses.length - 1]}`,
                declaration: data.declartion,
                value: data.value,
                precedence: data.precedence
            }

            if (styleParser.get(false, params.rule, params.declaration, this.currentPrelude) == undefined) {
                StyleEditors.createDeclaration(
                    params,
                    this.styleSheet,
                    this.stateService.getStyleParser(),
                    this.currentPrelude
                );
                let declaration = this.stateService.getStyleParser().get(true, params.rule, params.declaration, this.currentPrelude)
                if (declaration)
                    this.saveStyleDeclarationCreateToHistory(declaration as object, params.value, params.rule, this.currentPrelude)
            } else {
                let oldValue = this.stateService.getStyleParser().get(false, params.rule, params.declaration, this.currentPrelude)
                StyleEditors.updateDeclaration(
                    params,
                    this.styleSheet,
                    this.stateService.getStyleParser(),
                    this.currentPrelude
                );

                let declaration = this.stateService.getStyleParser().get(true, params.rule, params.declaration, this.currentPrelude)
                if (declaration && oldValue)
                    this.saveStyleDeclarationUpdateToHistory(declaration as object, oldValue as string, params.value, params.rule, this.currentPrelude)
            }
            gs.clear()
            gs.drawSelected(this.selected, SELECTION_MODE.MULTISELECT);
            this.updateUIState()
        }

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

    static init(window: HTMLIFrameElement, styleSheet: HTMLStyleElement) {
        instance = new Toolspace(window, styleSheet);
    }

    static getInstance(): Toolspace {
        if (instance != undefined) {
            return instance
        }
        else
            throw Error('Toolspace not instantiated');
    }

    /* 
    if update then transfor to create (rule and declaration):: then save op as create_rule and clone rule
    if undo:: delete op is triggered by removing rule from ast and parsing
    CUD ops for rules do not interract with history service

    */
    saveStyleDeclarationUpdateToHistory(declaration: object, oldValue: string, newValue: string, selector: string, mediaPrelude?: string) {

        const state: State = {
            operationType: OPERTATION_TYPE.STYLE,
            operationMode: OPERTATION_MODE.UPDATE_DECLARATION,
            operands: {
                declaration: declaration,
                selector: selector,
                oldValue: oldValue,
                newValue: newValue,
                mediaPrelude: mediaPrelude,
                stylesheet: this.styleSheet
            }
        }
        this.historyService.push(state)
    }
    saveStyleDeclarationCreateToHistory(declaration: object, newValue: string, selector: string, mediaPrelude?: string) {

        const state: State = {
            operationType: OPERTATION_TYPE.STYLE,
            operationMode: OPERTATION_MODE.CREATE_DECLARATION,
            operands: {
                declaration: declaration,
                selector: selector,
                mediaPrelude: mediaPrelude,
                newValue: newValue,
                stylesheet: this.styleSheet
            }
        }
        this.historyService.push(state)
    }
}