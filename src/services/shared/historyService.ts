/**
 * Redo and undo functionalities
 * event handling happens outside
 * two stacks name redo and undo
 * exports include enums and class
 * the service manipulates the model state and view 
 * 
 * DOM | DELETE | ELT(clone or ref), SIBLING?, PARENT? (before op)
 * DOM | UPDATE | ELT(clone or ref), SIBLING?, PARENT?, O_SIBLING?, O_PARENT? 
 * DOM | CREATE | ELT(clone or ref), SIBLING?, PARENT? (before op)
 * 
 * CSS | DELETE_DECLARATION | DEC(clone or ref), RULE_SELECTOR (before op)
 * CSS | DELETE_SELECTOR | SELECTOR(clone or ref), RULE_SELECTOR
 * CSS | DELETE_RULE | RULE(clone or ref)
 * 
 * CSS | UPDATE_DECLARATION | DEC(clone or ref), VALUE, O_VALUE (after op)
 * 
 * CSS | CREATE_DECLARATION | DEC(clone or ref), RULE_SELECTOR (after op)
 * CSS | CREATE_RULE | RULE(clone or ref), RULE_SELECTOR
 * CSS | CREATE_SELECTOR | SEL(clone or ref), RULE_SELECTOR

 * 
 */

import { TemplateEditors } from '../shared/templateEditor'
import { PLACEMENT_MODE } from "../guidespace"
import { StyleEditors } from './styleEditor';
import { StateService } from './stateService';
import { Toolspace } from '../toolspace';
import { Workspace } from '../workspace';


export enum OPERTATION_TYPE {
    DOM, STYLE, SCRIPT
}
export enum OPERTATION_MODE {
    DELETE, UPDATE, CREATE, UPDATE_TEXT, UPDATE_DECLARATION, DELETE_DECLARATION, DELETE_SELECTOR, DELETE_RULE, CREATE_DECLARATION, CREATE_SELECTOR, CREATE_RULE
}

export type StyleOperands = {
    declaration: string;
    selector: string;
    rule: string;
    oldValue: string;
    newValue: string;
    stylesheet: HTMLStyleElement;
    mediaPrelude: string;
}
export type DomOperands = {
    element: HTMLElement;
    sibling: HTMLElement;
    previousSibling: HTMLElement;
    parent: HTMLElement;
    previousParent: HTMLElement;
    previousText: string;
    text: string;
}
export type ScriptOperand = {

    //TODO-------------
}


export type State = {

    operationType: OPERTATION_TYPE;
    operationMode: OPERTATION_MODE;
    operands: StyleOperands | DomOperands | ScriptOperand

}
const MAX_SAVES = 200
//depends on template editor
export class HistoryService {


    private static instance: HistoryService = new HistoryService()


    private undoStack: Array<State>
    private redoStack: Array<State>

    private constructor() {
        this.redoStack = new Array<State>()
        this.undoStack = new Array<State>()
    }

    static init() {
        HistoryService.instance = new HistoryService();

    }
    push(state: State) {
        if (this.undoStack.length > MAX_SAVES)
            this.undoStack.splice(0, 1)
        if (this.redoStack.length > 0) {
            this.redoStack.splice(0)
        }
        this.undoStack.push(state);
        // console.log("state pushed");


    }
    static deserializeToStack(serialized: string, undo: boolean) {

        let states = JSON.parse(serialized) as Array<any>
        let deserializedStates = new Array<State>()
        for (let state of states) {


            const deserializedState = JSON.parse(state)
            const opType = deserializedState.operationType as OPERTATION_TYPE

            switch (opType) {
                case OPERTATION_TYPE.DOM: {
                    const operands = deserializedState.operands
                    Object.keys(operands).forEach(operand => {
                        if (["element",
                            "sibling",
                            "previousSibling",
                            "parent",
                            "previousParent"].includes(operand)) {
                            const odinID = operands[operand] as string
                            const elt = Workspace.getInstance().getRoot().contentDocument?.querySelector(`[odin-id="${odinID.trim()}"]`)
                            operands[operand] = elt
                        }
                    })
                    break
                }
                case OPERTATION_TYPE.STYLE: {
                    const operands = deserializedState.operands
                    Object.keys(operands).forEach(operand => {
                        if (operand = "stylesheet") {
                            const odinID = operands[operand] as string
                            const elt = Workspace.getInstance().getRoot().contentDocument?.querySelector(`[odin-id="odinStyleSheet"]`)
                            operands[operand] = elt
                        }
                    })
                    break

                }
            }

            deserializedStates.push(deserializedState as State)
        }

        return deserializedStates
    }
    serializeStack(undo: boolean): string {

        let stack = undo ? this.undoStack : this.redoStack
        let transformed = Array<string>()

        for (let state of stack) {
            switch (state.operationType) {
                case OPERTATION_TYPE.DOM: {

                    const ops = state.operands as DomOperands
                    const element = ops.element?.getAttribute("odin-id")
                    const sibling = ops.sibling?.getAttribute("odin-id")
                    const previousSibling = ops.previousSibling?.getAttribute("odin-id")
                    const parent = ops.parent?.getAttribute("odin-id")
                    const previousParent = ops.previousParent?.getAttribute("odin-id")

                    const operands = {
                        element: element,
                        sibling: sibling,
                        previousSibling: previousSibling,
                        parent: parent,
                        previousParent: previousParent,
                        text: ops.text,
                        previousText: ops.previousText
                    }
                    const transformedState = {
                        operands: operands,
                        operationType: state.operationType,
                        operationMode: state.operationMode
                    }

                    transformed.push(JSON.stringify(transformedState));
                    break;
                }
                case OPERTATION_TYPE.STYLE: {
                    const ops = state.operands as StyleOperands

                    const operands = {
                        declaration: ops.declaration,
                        selector: ops.selector,
                        rule: ops.rule,
                        oldValue: ops.oldValue,
                        stylesheet: "odinStyleSheet",
                        mediaPrelude: ops.mediaPrelude,
                    }

                    const transformedState = {
                        operands: operands,
                        operationType: state.operationType,
                        operationMode: state.operationMode
                    }

                    transformed.push(JSON.stringify(transformedState));
                    break;
                }
            }
        }

        return JSON.stringify(transformed);
    }
    undo() {

        if (this.undoStack.length > 0) {
            const state = this.undoStack.pop()!


            switch (state.operationType) {
                case OPERTATION_TYPE.DOM: {

                    switch (state.operationMode) {
                        case OPERTATION_MODE.UPDATE: {
                            const operands = state.operands as DomOperands
                            if (operands.element.parentElement) {
                                if (operands.previousSibling) {
                                    TemplateEditors.placeInDOM(operands.previousSibling, operands.element, PLACEMENT_MODE.BEFORE, false);
                                }
                                else {
                                    TemplateEditors.placeInDOM(operands.previousParent, operands.element, PLACEMENT_MODE.INSIDE, false);

                                }
                                break
                            }
                        }

                        case OPERTATION_MODE.DELETE: {
                            const operands = state.operands as DomOperands
                            if (operands.previousSibling) {
                                TemplateEditors.placeInDOM(operands.previousSibling, operands.element, PLACEMENT_MODE.BEFORE, false);
                            }
                            else {
                                TemplateEditors.placeInDOM(operands.previousParent, operands.element, PLACEMENT_MODE.INSIDE, false);

                            }
                            break
                        }

                        case OPERTATION_MODE.CREATE: {
                            const operands = state.operands as DomOperands
                            TemplateEditors.deleteInDOM(operands.element);
                            break
                        }
                        case OPERTATION_MODE.UPDATE_TEXT: {
                            
                            const operands = state.operands as DomOperands
                            operands.element.innerHTML = operands.previousText

                            const doc = StateService.getInstance().getTemplateParser().getDocument();
                            const id = operands.element.getAttribute("odin-id")
                            const elt = doc.querySelector(`[odin-id="${id}"]`)
                            elt!.innerHTML! = operands.previousText

                            break;
                        }
                    }

                    break;
                }
                case OPERTATION_TYPE.STYLE: {
                    switch (state.operationMode) {
                        case OPERTATION_MODE.UPDATE_DECLARATION: {

                            const ops = (state.operands as StyleOperands)
                            const sel = ops.selector
                            const dec = ops.declaration
                            const val = ops.oldValue

                            StyleEditors.updateDeclaration(
                                { rule: sel, declaration: dec, value: val, precedence: false },
                                ops.stylesheet,
                                StateService.getInstance().getStyleParser(), ops.mediaPrelude
                            );
                            Toolspace.getInstance().updateUIState()
                            break;
                        }

                        case OPERTATION_MODE.CREATE_DECLARATION: {

                            const ops = (state.operands as StyleOperands)
                            const sel = ops.selector
                            const dec = ops.declaration
                            StyleEditors.removeDeclaration(
                                { rule: sel, declaration: dec },
                                ops.stylesheet,
                                StateService.getInstance().getStyleParser(), ops.mediaPrelude
                            )
                            Toolspace.getInstance().updateUIState()
                            break;
                        }
                    }
                    break;
                }
            }


            this.redoStack.push(state);
            // console.log(this.undoStack, this.redoStack, "from undo log");

        }
    }
    redo() {
        if (this.redoStack.length > 0) {
            const state = this.redoStack.pop()!
            //update changes
            switch (state.operationType) {
                case OPERTATION_TYPE.DOM: {

                    switch (state.operationMode) {
                        case OPERTATION_MODE.UPDATE: {
                            const operands = state.operands as DomOperands
                            if (operands.element.parentElement) {
                                if (operands.sibling) {
                                    TemplateEditors.placeInDOM(operands.sibling, operands.element, PLACEMENT_MODE.BEFORE, false);
                                }
                                else {
                                    TemplateEditors.placeInDOM(operands.parent, operands.element, PLACEMENT_MODE.INSIDE, false);

                                }
                            }
                            break;
                        }

                        case OPERTATION_MODE.DELETE: {
                            const operands = state.operands as DomOperands
                            TemplateEditors.deleteInDOM(operands.element)
                            break
                        }
                        case OPERTATION_MODE.CREATE: {
                            const operands = state.operands as DomOperands
                            if (operands.sibling && !operands.parent) {
                                TemplateEditors.placeInDOM(operands.sibling, operands.element, PLACEMENT_MODE.BEFORE, false);
                            }
                            else {
                                TemplateEditors.placeInDOM(operands.parent, operands.element, PLACEMENT_MODE.INSIDE, false);

                            }
                            break
                        }
                        case OPERTATION_MODE.UPDATE_TEXT: {
                            const operands = state.operands as DomOperands
                            operands.element.innerHTML = operands.text
                            break;
                        }
                    }

                    break;
                }

                case OPERTATION_TYPE.STYLE: {
                    switch (state.operationMode) {
                        case OPERTATION_MODE.UPDATE_DECLARATION: {

                            const ops = (state.operands as StyleOperands)
                            const sel = ops.selector
                            const dec = ops.declaration
                            const val = ops.newValue

                            StyleEditors.updateDeclaration(
                                { rule: sel, declaration: dec, value: val, precedence: false },
                                ops.stylesheet,
                                StateService.getInstance().getStyleParser(), ops.mediaPrelude
                            );
                            Toolspace.getInstance().updateUIState()
                            break;
                        }

                        case OPERTATION_MODE.CREATE_DECLARATION: {

                            const ops = (state.operands as StyleOperands)
                            const sel = ops.selector as string
                            const dec = ops.declaration as string
                            const val = ops.newValue as string

                            StyleEditors.createDeclaration(
                                { rule: sel, declaration: dec, value: val, precedence: false },
                                ops.stylesheet,
                                StateService.getInstance().getStyleParser(), ops.mediaPrelude
                            )
                            Toolspace.getInstance().updateUIState()
                            break;
                        }
                    }
                    break;
                }

            }


            this.undoStack.push(state);
            console.log(this.undoStack, this.redoStack, "from redo log");

        }
    }
    static getInstance() {
        return HistoryService.instance;
    }
}