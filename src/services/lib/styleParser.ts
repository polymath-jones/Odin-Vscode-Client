/**
 * create(-, ns , - ) create new rule with selectors
 * create(-, ns , ndcs) create new rule with selectors and
 * create(rs, ns , - ) create new selectors then append 
 * create(rs, - , ndcs ) create new declarations then append
 * create(rs, ns , ndcs ) create new selectors and declarations then append
 * 
 * delete(rs, - , - ) delete rule
 * delete(rs, os , - ) delete a selector from rule and return new rule selector
 * delete(rs, - , dc ) delete a declaration from rule
 */
export class StyleParser {


    private parser = require("boreas/lib/parser");
    private AST = require("boreas/lib/ast");
    private PrettyPrinter = require('boreas/lib/pretty-printer');
    private cache: { [key: string]: { [key: string]: any } } = {}
    private styleSheet: any;

    constructor(src: string) {
        try {
            this.styleSheet = this.parser.parse(src);
        }
        catch (e) {
            console.log(e);
        }
    }
    formatSelector(src: string): string {
        var source = src.trim();
        var splitted = source.match(/(([^\s>~+,]+)|([>~+,]+)|([^\s>~+,]+))/g)!.join(" ").split(',')
        var trimmed = splitted.map((selector) => { return selector.trim() })
        trimmed.sort()
        return trimmed.join(",")
    }
    update(ruleSelectors: string, declaration: string, newValue: string) {

        const sortedSelList = this.formatSelector(ruleSelectors);
        const decMap = this.cache[sortedSelList]
        var cached = false
        if (decMap)
            cached = declaration in decMap

        if (!cached) {
            this.styleSheet.getRules().forEach((rule: any) => {
                var sels = rule.getSelectors()
                var decs = rule.getDeclarations()
                var sortedSels = this.formatSelector(sels.toString())
                var eq = sortedSelList == sortedSels
                if (eq) {
                    decs.forEach((dec: any) => {

                        if (dec.getNameAsString() == declaration) {

                            dec.setValue(newValue);
                            const decMap = this.cache[sortedSelList]
                            if (!decMap) this.cache[sortedSelList] = { [declaration]: dec }
                            else decMap[declaration] = dec;

                        }
                    })
                }

            });

        }
        else {
            this.cache[sortedSelList][declaration].setValue(newValue)
        }

    }
    get(ruleSelectors: string, declaration: string): string | undefined {

        const sortedSelList = this.formatSelector(ruleSelectors);
        const decMap = this.cache[sortedSelList]
        var cached = false
        if (decMap)
            cached = declaration in decMap

        if (!cached) {
            var now = Date.now()
            this.styleSheet.getRules().forEach((rule: any) => {
                var sels = rule.getSelectors()
                var decs = rule.getDeclarations()
                var sortedSels = this.formatSelector(sels.toString())
                var eq = sortedSelList == sortedSels
                if (eq) {
                    decs.forEach((dec: any) => {

                        if (dec.getNameAsString() == declaration) {

                            const decMap = this.cache[sortedSelList]
                            if (!decMap) this.cache[sortedSelList] = { [declaration]: dec }
                            else decMap[declaration] = dec;

                            return dec.getValue();

                        }
                    })
                }

            });
            console.log(Date.now() - now + ':ms before caching')

        }
        else {
            return this.cache[sortedSelList][declaration].getValue()
        }
        return undefined
    }
    create(ruleSelectors?: string, newSelectors?: string, declarations?: string) {

        //new rule: needs new selector. declaration optional
        if (newSelectors && !ruleSelectors) {
            //no declarations
            if (!declarations) {
                this.styleSheet.insertRule(
                    new this.AST.Rule(
                        this.parser.parseSelectors(newSelectors),
                        null
                    )
                )
            }
            //both declarations and selectors
            else {
                this.styleSheet.insertRule(
                    new this.AST.Rule(
                        this.parser.parseSelectors(newSelectors),
                        this.parser.parseDeclarations(declarations)
                    )
                )
            }
        }
        //new selector or declaration or both
        else if (ruleSelectors && (newSelectors || declarations)) {

            //new selector only
            if (!declarations) {

                const sortedSelList = this.formatSelector(ruleSelectors)
                this.styleSheet.getRules().forEach((rule: any) => {

                    var sels = rule.getSelectors()
                    var sortedSels = this.formatSelector(sels.toString())
                    var eq = sortedSelList == sortedSels
                    if (eq) {
                        this.parser.parseSelectors(newSelectors).forEach((sel: any) => {
                            sels.insertSelector(sel, 0)
                        });

                    }

                });
            }

            else {
                //new declarations only
                if (!newSelectors) {

                    const sortedSelList = this.formatSelector(ruleSelectors)
                    this.styleSheet.getRules().forEach((rule: any) => {

                        var sels = rule.getSelectors()
                        var decs = rule.getDeclarations()
                        var sortedSels = this.formatSelector(sels.toString())
                        var eq = sortedSelList == sortedSels
                        if (eq) {
                            this.parser.parseDeclarations(declarations).forEach((dec: any) => {
                                if (this.get(ruleSelectors, dec.getNameAsString()) == undefined)
                                    decs.insertDeclaration(dec)
                            });
                        }

                    });
                }

                else {
                    // new selectors and declarations
                    const sortedSelList = this.formatSelector(ruleSelectors)
                    this.styleSheet.getRules().forEach((rule: any) => {

                        var sels = rule.getSelectors()
                        var decs = rule.getDeclarations()
                        var sortedSels = this.formatSelector(sels.toString())
                        var eq = sortedSelList == sortedSels
                        if (eq) {
                            this.parser.parseSelectors(newSelectors).forEach((sel: any) => {
                                sels.insertSelector(sel, 0)
                            });
                            this.parser.parseDeclarations(declarations).forEach((dec: any) => {
                                decs.insertDeclaration(dec)
                            });
                        }

                    });
                }
            }
        }




    }
    delete(ruleSelectors?: string, oldSelector?: string, declaration?: string): string | void {
        if (ruleSelectors && !oldSelector && !declaration) {
            //delete rule
            const sortedSelList = this.formatSelector(ruleSelectors)
            const rules = this.styleSheet.getChildren()[0].getChildren()

            for (var j = 0; j < rules.length; j++) {
                var rule = rules[j];
                var sels = rule.getSelectors()
                var sortedSels = this.formatSelector(sels.toString())
                var eq = sortedSelList == sortedSels
                if (eq) {
                    this.styleSheet.deleteRule(j);
                }

            }

        }
        else if (ruleSelectors && oldSelector) {

            //delete selectors
            const sortedSelList = this.formatSelector(ruleSelectors)
            const todelete = this.formatSelector(oldSelector)
            const rules = this.styleSheet.getChildren()[0].getChildren()

            for (var i = 0; i < rules.length; i++) {

                var rule = rules[i];
                var sels = rule.getSelectors()
                var sortedSels = this.formatSelector(sels.toString())
                var eq = sortedSelList == sortedSels
                var children = sels.getChildren()
                if (children.length == 0)
                    break;


                if (eq) {

                    for (var j = 0; j < children.length; j++) {
                        var selector = children[j].toString().replace(/[,]+/g, '').trim()

                        if (todelete == selector) {
                            rule.deleteSelector(j);
                            if (sels.getChildren().length == 0) {
                                this.styleSheet.deleteRule(i);
                            } else {
                                return this.formatSelector(rule.getSelectors().toString())
                            }

                        }
                    }

                }
            }
        }
        else if (ruleSelectors && declaration && !oldSelector) {

            //delete declaration
            const sortedSelList = this.formatSelector(ruleSelectors)
            const rules = this.styleSheet.getChildren()[0].getChildren()

            for (var i = 0; i < rules.length; i++) {

                var rule = rules[i];
                var sels = rule.getSelectors()
                var sortedSels = this.formatSelector(sels.toString())
                var eq = sortedSelList == sortedSels

                if (eq) {

                    var decs = rule.getDeclarations()

                    for (var i = 0; i < decs._nodes.length; i++) {
                        var dec = decs[i];
                        if (dec.getNameAsString() == declaration) {
                            rule.deleteDeclaration(i);
                        }
                    }
                }
            }
        }
    }
    resetRuleDeclarations(ruleSelectors: string) {

        const sortedSelList = this.formatSelector(ruleSelectors)
        const rules = this.styleSheet.getChildren()[0].getChildren()

        for (var i = 0; i < rules.length; i++) {

            var rule = rules[i];
            var sels = rule.getSelectors()
            var sortedSels = this.formatSelector(sels.toString())
            var eq = sortedSelList == sortedSels

            if (eq) {
                rule.deleteAllDeclarations()
            }
        }
    }
    resetRuleSelectors(ruleSelectors: string, newSelectors: string) {
        const sortedSelList = this.formatSelector(ruleSelectors)
        const rules = this.styleSheet.getChildren()[0].getChildren()

        for (var i = 0; i < rules.length; i++) {

            var rule = rules[i];
            var sels = rule.getSelectors()
            var sortedSels = this.formatSelector(sels.toString())
            var eq = sortedSelList == sortedSels

            if (eq) {
                rule.setSelectors(this.parser.parseSelectors(newSelectors))
            }
        }
    }
    print(): string | void {
     //   console.log(this.PrettyPrinter.beautify(this.styleSheet));
        return this.PrettyPrinter.beautify(this.styleSheet);
    }
}
