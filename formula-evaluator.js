export class FormulaEvaluator {
  constructor(formula = "", ...functions) {
    this.formula = formula;
    this.functions = functions;
  }

  addFunction(...functions) {
    this.functions = this.functions.concat(functions);
  }

  serializeData(data) {
    return `const contextData = ${JSON.stringify(data)};`;
  }

  setFomula(formula) {
    this.formula = formula;
  }

  getVariables() {
    const regexp = new RegExp(/\[(.+)\]/);
    const variablePaths = this.formula.match(regexp);
    return variablePaths.map(variablePath => variablePath.slice(1, -1));
  }

  getParsedFormula() {
    const variablePaths = this.getVariables();
    return variablePaths.reduce((formula, variablePath) => {
      const path = variablePath.startsWith("[")
        ? variablePath
        : `.${variablePath}`
      return formula.replaceAll(
        variablePath,
        `contextData${path}`
      );
    }, this.formula);
  }

  createFunctionsContext() {
    return this.functions.reduce((context, currentFunction) => {
      return `${context}\nconst ${currentFunction.name} = ${currentFunction.body};`
    }, "");
  }

  createContext(data) {
    const serializedData = this.serializeData(data);
    const functionsContext = this.createFunctionsContext();
    const parsedFormula = this.getParsedFormula();
    return `${serializedData}\n${functionsContext}\n${parsedFormula};`
  }

  evaluate(contextData) {
    const context = this.createContext(contextData);
    return eval(context);
  }
}