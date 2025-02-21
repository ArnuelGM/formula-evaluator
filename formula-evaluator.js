export class FormulaEvaluator {
  constructor(formula = "", functions = {}) {
    this.formula = formula;
    this.functions = functions;
  }

  addFunction(newFunction) {
    this.functions = { ...this.functions, ...newFunction };
  }

  serializeData(data) {
    const serializedData = `const contextData = ${JSON.stringify(data)};`;
    return serializedData;
  }

  setFomula(formula) {
    this.formula = formula;
  }

  getVariables() {
    const regexp = new RegExp(/\[(?:[a-zA-Z_$][a-zA-Z_$0-9]*|\[(?:\d+|"(?:[^"]|(?:\\"))+"|'(?:[^']|(?:\\'))+'|`(?:[^`]|(?:\\`))+`)\])(?:(?:\.[a-zA-Z_$][a-zA-Z_$0-9]*)*(?:\[(?:\d+|"(?:[^"]|(?:\\"))+"|'(?:[^']|(?:\\'))+'|`(?:[^`]|(?:\\`))+`)\])*)*\]/g);
    const variablePaths = new Set(this.formula.match(regexp) ?? []);
    return Array.from(variablePaths);
  }

  getParsedFormula() {
    const variablePaths = this.getVariables();
    const parsedFormula = variablePaths.reduce((formula, variablePath) => {
      const variable = variablePath.slice(1, -1);
      const path = variable.startsWith("[") ? variable : `.${variable}`;
      return formula.replaceAll(variablePath, `contextData${path}`);
    }, this.formula);
    return parsedFormula;
  }

  createFunctionsContext() {
    const functions = Object.keys(this.functions).map((name) => {
      return `const ${name} = ${this.functions[name].toString()};`
    }).join("\n    ");
    return functions;
  }

  createContext(data) {
    const parsedFormula = this.getParsedFormula();
    const serializedData = this.serializeData(data);
    const functionsContext = this.createFunctionsContext();
    const executionContext = `(function() {
  try {
    ${serializedData}
    ${functionsContext}
    return (${parsedFormula.trim()});
  } catch(e) {
    throw e;
  }
})();`;
    return executionContext;
  }

  evaluate(contextData) {
    const context = this.createContext(contextData);
    return eval(context);
  }
}


/*
const functions = {
  add: (a, b) => (
    new Promise(resolve => {
      setTimeout(() => resolve(a + b), 4000);
    })
  ),
  
  mul: (a, b) => a * b,
};

const f = new FormulaEvaluator(`
  add(
    [a.b],
    mul([a.b], [b.c['hola mundo'][0].d])
  )
`, functions);

const context = {
  a: {
    b: 4
  },
  b: {
    c: { 
      "hola mundo": [
        { d: 5 }
      ]
    }
  }
};

f.evaluate(context)
  .then(console.log) <----------------------------- 24
  .catch((e) => {
    console.log("error:", e.message);
  });
*/






