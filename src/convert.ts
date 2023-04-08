import type ts from 'typescript'
import { getDecoratorNames, getClassDeclarationNodes } from './utils'
import { runPlugins } from './plugins'
import { Vc2cOptions } from './options'
import { log } from './debug'

const vueClassModules = [
  'vue-class-component',
  'vue-property-decorator'
]

export function convertAST (sourceFile: ts.SourceFile, options: Vc2cOptions, program: ts.Program): string {
  const tsModule = options.typescript

  log('check vue class library')
  const vueClassModuleImportStatement = sourceFile.statements
    .find((statement) => {
      if (tsModule.isImportDeclaration(statement)) {
        if (vueClassModules.includes((statement.moduleSpecifier as ts.StringLiteral).text)) {
          return true
        }
      }
      return false
    })
  if (!vueClassModuleImportStatement) {
    throw new Error('no vue class library in this file.')
  }

  log('check default export class')

  const otherStatements = sourceFile.statements
    .map((el) => el)
    .filter((el) =>
      !((tsModule.isClassDeclaration(el) && getDecoratorNames(tsModule, el).includes('Component')) ||
      (tsModule.isImportDeclaration(el) && vueClassModules.includes((el.moduleSpecifier as ts.StringLiteral).text)) ||
      (tsModule.isImportDeclaration(el) && (el.moduleSpecifier as ts.StringLiteral).text === 'vue'))
    )

  let resultStatements = otherStatements;

  const classNodes = getClassDeclarationNodes(options.typescript, sourceFile)
  if (!classNodes) {
    throw new Error('no class components found')
  }

  for (let cNode of classNodes) {
    resultStatements = [...resultStatements, ...runPlugins(cNode, options, program)];
  }

  resultStatements = [
    ...resultStatements.filter((el) => tsModule.isImportDeclaration(el)),
    ...resultStatements.filter((el) => !tsModule.isImportDeclaration(el))
  ]

  log('output result code')
  const printer = tsModule.createPrinter()
  const result = printer.printFile(tsModule.factory.updateSourceFile(sourceFile, resultStatements))

  return result
}
