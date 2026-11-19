window.SezanPython = (function() {
  function convertExpr(expr) {
    expr = expr.replace(/f(["'])(.*?)\1/g, function(_, q, body) {
      var tpl = body.replace(/\{([^}]+)\}/g, '${$1}');
      return '`' + tpl + '`';
    });
    expr = expr.replace(/(\b[a-zA-Z0-9_.)]+)\s*\*\*\s*([a-zA-Z0-9_.(]+)/g, 'Math.pow($1, $2)');
    expr = expr.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
    expr = expr.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!');
    expr = expr.replace(/\.append\(/g, '.push(');
    return expr;
  }

  function transpile(py) {
    var rawLines = py.split('\n');
    var jsLines = [];
    var indentStack =;
    var declaredVars = {};

    for (var i = 0; i < rawLines.length; i++) {
      var line = rawLines[i];
      var trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) continue;

      var indent = line.match(/^\s*/).length;

      while (indent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        jsLines.push('}');
      }

      if (trimmed.endsWith(':')) {
        var header = trimmed.slice(0, -1).trim();

        if (header.startsWith('if ')) {
          jsLines.push('if (' + convertExpr(header.slice(3)) + ') {');
          indentStack.push(indent + 1);
        } else if (header.startsWith('elif ')) {
          jsLines.push('} else if (' + convertExpr(header.slice(5)) + ') {');
          indentStack.push(indent + 1);
        } else if (header === 'else') {
          jsLines.push('} else {');
          indentStack.push(indent + 1);
        } else if (header.startsWith('while ')) {
          jsLines.push('while (' + convertExpr(header.slice(6)) + ') {');
          indentStack.push(indent + 1);
        } else if (header.startsWith('for ')) {
          var mRange2 = header.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\s*\(([^,]+),([^)]+)\)$/);
          var mRange1 = header.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\s*\(([^)]+)\)$/);
          var mList = header.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+(.+)$/);

          if (mRange2) {
            jsLines.push('for (var ' + mRange2 + ' = ' + convertExpr(mRange2) + '; ' + mRange2 + ' < ' + convertExpr(mRange2) + '; ' + mRange2 + '++) {');
          } else if (mRange1) {
            jsLines.push('for (var ' + mRange1 + ' = 0; ' + mRange1 + ' < ' + convertExpr(mRange1) + '; ' + mRange1 + '++) {');
          } else if (mList) {
            jsLines.push('for (var ' + mList + ' of ' + convertExpr(mList) + ') {');
          } else {
            throw new Error('Ошибка в цикле for (строка ' + (i + 1) + ')');
          }
          indentStack.push(indent + 1);
        } else {
          throw new Error('Неподдерживаемый блок (строка ' + (i + 1) + '): ' + trimmed);
        }
      } else {
        var assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*(=|\+=|-=|\*=|\/=)\s*(.+)$/);
        if (assignMatch && !trimmed.includes('==')) {
          var vName = assignMatch;
          var op = assignMatch;
          var val = convertExpr(assignMatch);
          if (op === '=' && !declaredVars[vName]) {
            declaredVars[vName] = true;
            jsLines.push('var ' + vName + ' = ' + val + ';');
          } else {
            jsLines.push(vName + ' ' + op + ' ' + val + ';');
          }
        } else {
          jsLines.push(convertExpr(trimmed) + ';');
        }
      }
    }

    while (indentStack.length > 1) {
      indentStack.pop();
      jsLines.push('}');
    }

    return jsLines.join('\n');
  }

  function execute(code) {
    var output = [];
    var pyEnv = {
      print: function() {
        var args = Array.prototype.slice.call(arguments).map(function(a) {
          if (a === true) return 'True';
          if (a === false) return 'False';
          if (a === null || a === undefined) return 'None';
          if (Array.isArray(a)) return '[' + a.map(function(x) { return typeof x === 'string' ? "'" + x + "'" : x; }).join(', ') + ']';
          return String(a);
        });
        output.push(args.join(' '));
      },
      len: function(x) { return x.length; },
      int: function(x) { return parseInt(x, 10); },
      float: function(x) { return parseFloat(x); },
      str: function(x) { return String(x); },
      abs: Math.abs,
      round: Math.round,
      max: Math.max,
      min: Math.min,
      math: {
        sqrt: Math.sqrt,
        pow: Math.pow,
        pi: Math.PI,
        sin: Math.sin,
        cos: Math.cos,
        floor: Math.floor,
        ceil: Math.ceil
      },
      random: {
        randint: function(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        choice: function(arr) {
          return arr[Math.floor(Math.random() * arr.length)];
        }
      }
    };

    try {
      var jsCode = transpile(code);
      var runner = new Function('env', 'with (env) {\n' + jsCode + '\n}');
      runner(pyEnv);
      return {
        ok: true,
        text: output.length ? output.join('\n') : '>>> Программа выполнена (вывода нет).'
      };
    } catch (err) {
      return {
        ok: false,
        text: 'Traceback (Python Error):\n' + err.message
      };
    }
  }

  return {
    execute: execute
  };
})();
