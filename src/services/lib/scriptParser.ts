
import { Project, ObjectLiteralExpression, PropertyAssignment, ShorthandPropertyAssignmentStructure, StructureKind, SourceFile, ImportDeclarationStructure } from 'ts-morph';


export class ScriptParser {

    project!: Project
    source!: SourceFile

    constructor(src: string) {

        this.project = new Project({
            useInMemoryFileSystem: true
        })
        try { this.source = this.project.createSourceFile('', src) }
        catch (e) { console.log(e) }
    }

    addComponent(name: string, url: string) {

        const propAssginmentStructure: ShorthandPropertyAssignmentStructure = {
            kind: StructureKind.ShorthandPropertyAssignment,
            name: name
        };

        const importDeclarationStructure: ImportDeclarationStructure = {
            kind: StructureKind.ImportDeclaration,
            moduleSpecifier: url
        };
        this.source.getClasses()[0].getDecorator('Options')?.getCallExpression()?.getArguments().forEach(arg => {
            if (arg instanceof ObjectLiteralExpression) {
                const obe = arg as ObjectLiteralExpression
                const components = obe.getProperty("components") as PropertyAssignment
                const initializer = components.getInitializer()
                if (initializer instanceof ObjectLiteralExpression) {
                    const parameters = initializer as ObjectLiteralExpression

                    if (!parameters.getProperty(name))
                        parameters.addProperty(propAssginmentStructure)
                }
            }

        })

        this.source.insertImportDeclaration(0, importDeclarationStructure)

    }

    removeComponent(name: string, url: string) {
        this.source.getClasses()[0].getDecorator('Options')?.getCallExpression()?.getArguments().forEach(arg => {
            if (arg instanceof ObjectLiteralExpression) {
                const obe = arg as ObjectLiteralExpression
                const components = obe.getProperty("components") as PropertyAssignment
                const initializer = components.getInitializer()
                if (initializer instanceof ObjectLiteralExpression) {
                    const parameters = initializer as ObjectLiteralExpression
                    parameters.getProperty(name)?.remove()
                }
            }

        })


        let declaration = this.source.getImportDeclaration(impdec => {
            if (impdec.getModuleSpecifierValue() == url)
                return true
            return false
        })
        declaration!.remove()
    }

    print():string{
        return this.source.print()
    }


}