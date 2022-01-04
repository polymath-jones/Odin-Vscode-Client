import store from "@/store";

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
 * 
 * get(rs, dc) get declaration value or return undefined if it does not exist
 * get(rs, -) get selector or return undefined if it does not exist
 * get(-,-) get all rules in stylesheet
 * 
 * update(rs,dc,nv) update declaration with new value
 * 
 * !important:: HACKY CODE
 */
export class StyleParser {


    private parser = require("boreas/lib/parser");
    private AST = require("boreas/lib/ast");
    private PrettyPrinter = require('boreas/lib/pretty-printer');
    private styleSheet: any;

    constructor(src: string) {
        try {
            this.styleSheet = this.parser.parse(src);
        }
        catch (e) {
            console.log(e);
        }
    }
    getRuleInsertPos(): number | undefined {
        const rules = this.styleSheet.getRules().getChildren()
        for (let i = 0; i < rules.length; i++) {
            if (rules[i] instanceof this.AST.AtMedia)
                return i
        }
        return undefined
    }
    formatSelector(src: string): string {
        var source = src.trim();
        var splitted = source.match(/(([^\s>~+,]+)|([>~+,]+)|([^\s>~+,]+))/g)!.join(" ").split(',')
        var trimmed = splitted.map((selector) => { return selector.trim() })
        trimmed.sort()
        return trimmed.join(",")
    }


    update(ruleSelectors: string, declaration: string, newValue: string, mediaPrelude?: string) {

        const sortedSelList = this.formatSelector(ruleSelectors);
        if (!mediaPrelude) {


            this.styleSheet.getRules().forEach((rule: any) => {

                if ((rule instanceof this.AST.Rule)) {

                    var sels = rule.getSelectors()
                    var decs = rule.getDeclarations()
                    var sortedSels = this.formatSelector(sels.toString())
                    var eq = sortedSelList == sortedSels
                    if (eq) {
                        decs.forEach((dec: any) => {

                            if (dec.getNameAsString() == declaration) {

                                dec.setValue(newValue);
                            }
                        })
                    }

                }
            });


        } else {
            //media queries update
            this.styleSheet.getRules().forEach((rule: any) => {

                if ((rule instanceof this.AST.AtMedia)) {

                    if (rule.getPrelude().toString().trim() == mediaPrelude.trim()) {
                        rule.getRules().forEach((rule: any) => {

                            if ((rule instanceof this.AST.Rule)) {

                                var sels = rule.getSelectors()
                                var decs = rule.getDeclarations()
                                var sortedSels = this.formatSelector(sels.toString())
                                var eq = sortedSelList == sortedSels
                                if (eq) {
                                    decs.forEach((dec: any) => {

                                        if (dec.getNameAsString() == declaration) {
                                            dec.setValue(newValue);
                                        }
                                    })
                                }

                            }
                        });
                    }

                }
            })
        }

    }
    get(objectType: boolean, ruleSelectors?: string, declaration?: string, mediaPrelude?: string): Array<object> | object | string | undefined {


        if (ruleSelectors) {
            const sortedSelList = this.formatSelector(ruleSelectors);
            //get declaration
            if (declaration) {

                let value: string | undefined | object = undefined

                if (!mediaPrelude) {
                    this.styleSheet.getRules().forEach((rule: any) => {

                        if ((rule instanceof this.AST.Rule)) {

                            var sels = rule.getSelectors()
                            var decs = rule.getDeclarations()
                            var sortedSels = this.formatSelector(sels.toString())
                            var eq = sortedSelList == sortedSels
                            if (eq && decs) {

                                decs.forEach((dec: any) => {

                                    if (dec.getNameAsString() == declaration) {

                                        value = objectType ? dec : dec.getValue().getText() as string

                                    }
                                })
                            }

                        }

                    });
                    return value
                }
                else {

                    this.styleSheet.getRules().forEach((rule: any) => {

                        if ((rule instanceof this.AST.AtMedia)) {
                            if (rule.getPrelude().toString().trim() == mediaPrelude.trim()) {

                                rule.getRules().forEach((rule: any) => {

                                    var sels = rule.getSelectors()
                                    var decs = rule.getDeclarations()
                                    var sortedSels = this.formatSelector(sels.toString())
                                    var eq = sortedSelList == sortedSels
                                    if (eq && decs) {

                                        decs.forEach((dec: any) => {

                                            if (dec.getNameAsString() == declaration) {
                                                value = objectType ? dec : dec.getValue().getText() as string

                                            }
                                        })
                                    }
                                })


                            }

                        }

                    });
                    return value
                }


            }
            //get rule
            else {

                let value: object | undefined = undefined

                if (!mediaPrelude) {

                    this.styleSheet.getRules().forEach((rule: any) => {

                        if ((rule instanceof this.AST.Rule)) {
                            var sels = rule.getSelectors()
                            var sortedSels = this.formatSelector(sels.toString())
                            var eq = sortedSelList == sortedSels
                            if (eq) {
                                value = rule
                            }
                        }

                    });
                    return value
                } else {
                    this.styleSheet.getRules().forEach((rule: any) => {

                        if ((rule instanceof this.AST.AtMedia)) {
                            if (rule.getPrelude().toString().trim() == mediaPrelude.trim()) {

                                rule.getRules().forEach((rule: any) => {
                                    if ((rule instanceof this.AST.Rule)) {
                                        var sels = rule.getSelectors()
                                        var sortedSels = this.formatSelector(sels.toString())
                                        var eq = sortedSelList == sortedSels
                                        if (eq) {
                                            value = rule
                                        }
                                    }
                                })
                                return value
                            }
                        }

                    })
                }

            }
        }
        //get all rules
        else {
            var rules = new Array<string>()

            if (!mediaPrelude) {
                this.styleSheet.getRules().forEach((rule: any) => {

                    if ((rule instanceof this.AST.Rule)) {
                        var sels = rule.getSelectors()
                        var sortedSels = this.formatSelector(sels.toString())
                        rules.push(sortedSels)
                    }

                })
            }
            else {
                this.styleSheet.getRules().forEach((rule: any) => {

                    if ((rule instanceof this.AST.AtMedia)) {
                        if (rule.getPrelude().toString().trim() == mediaPrelude.trim()) {

                            rule.getRules().forEach((rule: any) => {
                                if ((rule instanceof this.AST.Rule)) {
                                    var sels = rule.getSelectors()
                                    var sortedSels = this.formatSelector(sels.toString())
                                    rules.push(sortedSels)
                                }
                            })
                        }
                    }
                });
            }


            return rules
        }


    }
    create(ruleSelectors?: string, newSelectors?: string, declarations?: string, mediaPrelude?: string) {

        //new rule: requires a new selector. declaration optional
        if (newSelectors && !ruleSelectors) {

            if (!mediaPrelude) {
                //no declarations
                if (!declarations) {
                    this.styleSheet.insertRule(
                        new this.AST.Rule(
                            this.parser.parseSelectors(newSelectors),
                            this.parser.parseDeclarations(`{}`)
                        ), this.getRuleInsertPos()

                    )
                }
                //both declarations and selectors
                else {
                    console.log(newSelectors);

                    this.styleSheet.insertRule(
                        new this.AST.Rule(
                            this.parser.parseSelectors(newSelectors),
                            this.parser.parseDeclarations(declarations)
                        ), this.getRuleInsertPos()

                    )
                }
            } else {
                this.styleSheet.getRules().forEach((rule: any) => {

                    if ((rule instanceof this.AST.AtMedia)) {

                        if (rule.getPrelude().toString().trim() == mediaPrelude.trim()) {
                            //no declarations
                            if (!declarations) {
                                rule.getRules().insertRule(
                                    new this.AST.Rule(
                                        this.parser.parseSelectors(newSelectors),
                                        this.parser.parseDeclarations(`{}`),
                                    )

                                )
                            }
                            //both declarations and selectors
                            else {
                                rule.getRules().insertRule(
                                    new this.AST.Rule(
                                        this.parser.parseSelectors(newSelectors),
                                        this.parser.parseDeclarations(declarations)
                                    )
                                )
                            }
                        }
                    }
                })
            }

        }
        //new selector or declaration or both
        else if (ruleSelectors && (newSelectors || declarations)) {

            //new selector only
            if (!declarations) {

                const sortedSelList = this.formatSelector(ruleSelectors)

                if (!mediaPrelude) {
                    this.styleSheet.getRules().forEach((rule: any) => {

                        if ((rule instanceof this.AST.Rule)) {
                            var sels = rule.getSelectors()
                            var sortedSels = this.formatSelector(sels.toString())
                            var eq = sortedSelList == sortedSels
                            if (eq) {
                                this.parser.parseSelectors(newSelectors).forEach((sel: any) => {
                                    sels.insertSelector(sel, 0)
                                });

                            }
                        }



                    });
                } else {
                    this.styleSheet.getRules().forEach((rule: any) => {

                        if ((rule instanceof this.AST.AtMedia)) {
                            if (rule.getPrelude().toString().trim() == mediaPrelude.trim()) {
                                rule.getRules().forEach((rule: any) => {
                                    if ((rule instanceof this.AST.Rule)) {
                                        var sels = rule.getSelectors()
                                        var sortedSels = this.formatSelector(sels.toString())
                                        var eq = sortedSelList == sortedSels
                                        if (eq) {
                                            this.parser.parseSelectors(newSelectors).forEach((sel: any) => {
                                                sels.insertSelector(sel, 0)
                                            });

                                        }
                                    }
                                })
                            }
                        }
                    })
                }

            }

            else {
                //new declarations only
                if (!newSelectors) {

                    const sortedSelList = this.formatSelector(ruleSelectors)

                    if (!mediaPrelude) {
                        this.styleSheet.getRules().forEach((rule: any) => {

                            if ((rule instanceof this.AST.Rule)) {
                                var sels = rule.getSelectors()
                                var sortedSels = this.formatSelector(sels.toString())
                                var eq = sortedSelList == sortedSels
                                if (eq) {
                                    this.parser.parseDeclarations(declarations).forEach((dec: any) => {

                                        if (this.get(false, ruleSelectors, dec.getNameAsString()) == undefined) {
                                            rule.insertDeclaration(dec, 0)
                                        }

                                    });
                                }
                            }



                        });
                    } else {
                        this.styleSheet.getRules().forEach((rule: any) => {


                            if ((rule instanceof this.AST.AtMedia)) {
                                if (rule.getPrelude().toString().trim() == mediaPrelude.trim()) {
                                    rule.getRules().forEach((rule: any) => {

                                        if ((rule instanceof this.AST.Rule)) {


                                            var sels = rule.getSelectors()
                                            var sortedSels = this.formatSelector(sels.toString())
                                            var eq = sortedSelList == sortedSels
                                            if (eq) {

                                                this.parser.parseDeclarations(declarations).forEach((dec: any) => {

                                                    if (this.get(false, ruleSelectors, dec.getNameAsString(), mediaPrelude) == undefined) {
                                                        rule.insertDeclaration(dec, 0)
                                                    }

                                                });
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }

                }

                else {
                    // new selectors and declarations
                    const sortedSelList = this.formatSelector(ruleSelectors)

                    if (!mediaPrelude) {
                        this.styleSheet.getRules().forEach((rule: any) => {

                            if ((rule instanceof this.AST.Rule)) {
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
                            }


                        });
                    } else {
                        this.styleSheet.getRules().forEach((rule: any) => {

                            if ((rule instanceof this.AST.AtMedia)) {
                                if (rule.getPrelude().toString().trim() == mediaPrelude.trim()) {
                                    rule.getRules().forEach((rule: any) => {
                                        if ((rule instanceof this.AST.Rule)) {
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
                                        }
                                    })
                                }
                            }
                        })
                    }

                }
            }
        }




    }
    delete(ruleSelectors?: string, oldSelector?: string, declaration?: string, mediaPrelude?: string): string | void {


        if (ruleSelectors && !oldSelector && !declaration) {

            if (!mediaPrelude) {
                //delete rule
                const sortedSelList = this.formatSelector(ruleSelectors)


                const rules = this.styleSheet.getChildren()[0].getChildren()

                for (var j = 0; j < rules.length; j++) {
                    var rule = rules[j];
                    if ((rule instanceof this.AST.Rule)) {
                        var sels = rule.getSelectors()
                        var sortedSels = this.formatSelector(sels.toString())
                        var eq = sortedSelList == sortedSels
                        if (eq) {
                            this.styleSheet.deleteRule(j);
                        }
                    }


                }
            } else {

                //delete rule
                const sortedSelList = this.formatSelector(ruleSelectors)
                this.styleSheet.getRules().forEach((rule: any) => {

                    if ((rule instanceof this.AST.AtMedia)) {
                        if (rule.getPrelude().toString().trim() == mediaPrelude.trim()) {
                            for (let rules of rule.getChildren()) {
                                if (rules instanceof this.AST.RuleList) {

                                    for (var j = 0; j < rules.length; j++) {
                                        var rule = rules[j];
                                        if ((rule instanceof this.AST.Rule)) {
                                            var sels = rule.getSelectors()
                                            var sortedSels = this.formatSelector(sels.toString())
                                            var eq = sortedSelList == sortedSels
                                            if (eq) {
                                                rules.deleteRule(j);
                                            }
                                        }


                                    }
                                }
                            }
                        }
                    }
                })
            }



        }
        //todo
        else if (ruleSelectors && oldSelector) {

            //delete selectors
            const sortedSelList = this.formatSelector(ruleSelectors)
            const todelete = this.formatSelector(oldSelector)
            const rules = this.styleSheet.getChildren()[0].getChildren()

            for (var i = 0; i < rules.length; i++) {

                var rule = rules[i];
                if ((rule instanceof this.AST.Rule)) {
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
                                    this.styleSheet.deleteRule(j);
                                } else {
                                    return this.formatSelector(rule.getSelectors().toString())
                                }

                            }
                        }

                    }
                }

            }
        }
        else if (ruleSelectors && declaration && !oldSelector) {

            if (!mediaPrelude) {
                //delete declaration
                const sortedSelList = this.formatSelector(ruleSelectors)
                const rules = this.styleSheet.getChildren()[0].getChildren()

                for (var i = 0; i < rules.length; i++) {

                    var rule = rules[i];
                    if ((rule instanceof this.AST.Rule)) {
                        var sels = rule.getSelectors()
                        var sortedSels = this.formatSelector(sels.toString())
                        var eq = sortedSelList == sortedSels

                        if (eq) {

                            var decs = rule.getDeclarations()

                            for (var j = 0; j < decs._nodes.length; j++) {
                                var dec = decs[j];
                                if (dec.getNameAsString() == declaration) {
                                    rule.deleteDeclaration(j);
                                }
                            }
                        }
                    }

                }
            } else {
                const sortedSelList = this.formatSelector(ruleSelectors)
                this.styleSheet.getRules().forEach((rule: any) => {

                    if ((rule instanceof this.AST.AtMedia)) {
                        if (rule.getPrelude().toString().trim() == mediaPrelude.trim()) {
                            rule.getRules().forEach((rule: any) => {

                                var sels = rule.getSelectors()
                                var sortedSels = this.formatSelector(sels.toString())
                                var eq = sortedSelList == sortedSels

                                if (eq) {

                                    var decs = rule.getDeclarations()

                                    for (var j = 0; j < decs._nodes.length; j++) {
                                        var dec = decs[j];
                                        if (dec.getNameAsString() == declaration) {
                                            rule.deleteDeclaration(j);
                                        }
                                    }
                                }
                            })
                        }
                    }
                })
            }

        }
    }
    resetRuleDeclarations(ruleSelectors: string) {

        const sortedSelList = this.formatSelector(ruleSelectors)
        const rules = this.styleSheet.getChildren()[0].getChildren()

        for (var i = 0; i < rules.length; i++) {

            var rule = rules[i];
            if ((rule instanceof this.AST.Rule)) {
                var sels = rule.getSelectors()
                var sortedSels = this.formatSelector(sels.toString())
                var eq = sortedSelList == sortedSels

                if (eq) {
                    rule.deleteAllDeclarations()
                }
            }

        }
    }
    resetRuleSelectors(ruleSelectors: string, newSelectors: string) {

        const sortedSelList = this.formatSelector(ruleSelectors)
        const rules = this.styleSheet.getChildren()[0].getChildren()

        for (var i = 0; i < rules.length; i++) {

            var rule = rules[i];
            if ((rule instanceof this.AST.Rule)) {
                var sels = rule.getSelectors()
                var sortedSels = this.formatSelector(sels.toString())
                var eq = sortedSelList == sortedSels

                if (eq) {
                    rule.setSelectors(this.parser.parseSelectors(newSelectors))
                }
            }

        }
    }
    print(clean?: boolean): string | void {
        let src = this.PrettyPrinter.beautify(this.styleSheet) as string;
        if (clean)
            src = src.replace("!important", "");
        store.commit('setStyleSource', src)
        return src
    }
}
