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
    const regexp = new RegExp(/^\[((((\[(\d+|(("(?=.+"))|('(?=.+'))|(`(?=.+`))).+)\]))|[a-zA-Z_$]+)((\.[a-zA-Z_$]+)?((\[(\d+|(("(?=.+"))|('(?=.+'))|(`(?=.+`))).+)\]))*)*)\]/g);
    const variablePaths = this.formula.match(regexp) ?? [];
    return variablePaths;
  }

  getParsedFormula() {
    const variablePaths = this.getVariables();
    const parsedFormula = variablePaths.reduce((formula, prop) => {
      const path = `.${prop.slice(1, -1)}`;
      return formula.replaceAll(prop, `contextData${path}`);
    }, this.formula);
    return parsedFormula;
  }

  createFunctionsContext() {
    const functions = Object.keys(this.functions).map((name) => {
      return `const ${name} = ${this.functions[name].toString()};`
    }).join("\n");
    return functions;
  }

  createContext(data) {
    const parsedFormula = this.getParsedFormula();
    const serializedData = this.serializeData(data);
    const functionsContext = this.createFunctionsContext();
    return `(function() {
  try {
    ${serializedData}
    ${functionsContext}
    return (${parsedFormula.trim()});
  } catch(e) {
    throw e;
  }
})();`;
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






