"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.removeVariableDefinitionsFromDocumentIfUnused = exports.getVariablesFromValueNode = exports.getVariablesFromArguments = exports.getAllArgumentsFromFragment = exports.getAllArgumentsFromOperation = exports.getAllArgumentsFromDocument = exports.getAllArgumentsFromDirectives = exports.getAllArgumentsFromSelection = exports.getAllArgumentsFromSelectionSet = exports.removeDirectiveFromDocument = exports.getVariableOrDie = exports.valueForArgument = exports.materializeKey = exports.extractKey = void 0;
var utils_1 = require("@apollo/client/link/utils");
var utilities_1 = require("@apollo/client/utilities");
var DIRECTIVE_NAME = 'serialize';
var documentCache = new Map();
function extractDirectiveArguments(doc, cache) {
    if (cache === void 0) { cache = documentCache; }
    if (cache.has(doc)) {
        return cache.get(doc);
    }
    utilities_1.checkDocument(doc);
    var directive = extractDirective(utilities_1.getOperationDefinition(doc), DIRECTIVE_NAME);
    if (!directive) {
        return { doc: doc };
    }
    var argument = directive.arguments.find(function (d) { return d.name.value === 'key'; });
    if (!argument) {
        throw new Error("The @" + DIRECTIVE_NAME + " directive requires a 'key' argument");
    }
    if (argument.value.kind !== 'ListValue') {
        throw new Error("The @" + DIRECTIVE_NAME + " directive's 'key' argument must be of type List, got " + argument.kind);
    }
    var ret = {
        doc: removeDirectiveFromDocument(doc, directive),
        args: argument.value
    };
    cache.set(doc, ret);
    return ret;
}
function extractKey(operation) {
    var serializationKey = operation.getContext().serializationKey;
    if (serializationKey) {
        return { operation: operation, key: serializationKey };
    }
    var _a = extractDirectiveArguments(operation.query), doc = _a.doc, args = _a.args;
    if (!args) {
        return { operation: operation };
    }
    var key = materializeKey(args, operation.variables);
    var newOperation = utils_1.createOperation(operation.getContext(), __assign(__assign({}, operation), { query: doc }));
    return { operation: newOperation, key: key };
}
exports.extractKey = extractKey;
function extractDirective(query, directiveName) {
    return query.directives.filter(function (node) { return node.name.value === directiveName; })[0];
}
function materializeKey(argumentList, variables) {
    return JSON.stringify(argumentList.values.map(function (val) { return valueForArgument(val, variables); }));
}
exports.materializeKey = materializeKey;
function valueForArgument(value, variables) {
    if (value.kind === 'Variable') {
        return getVariableOrDie(variables, value.name.value);
    }
    if (value.kind === 'IntValue') {
        return parseInt(value.value, 10);
    }
    if (value.kind === 'FloatValue') {
        return parseFloat(value.value);
    }
    if (value.kind === 'StringValue' ||
        value.kind === 'BooleanValue' ||
        value.kind === 'EnumValue') {
        return value.value;
    }
    throw new Error("Argument of type " + value.kind + " is not allowed in @" + DIRECTIVE_NAME + " directive");
}
exports.valueForArgument = valueForArgument;
function getVariableOrDie(variables, name) {
    if (!variables || !(name in variables)) {
        throw new Error("No value supplied for variable $" + name + " used in @serialize key");
    }
    return variables[name];
}
exports.getVariableOrDie = getVariableOrDie;
function removeDirectiveFromDocument(doc, directive) {
    if (!directive) {
        return doc;
    }
    var docWithoutDirective = utilities_1.cloneDeep(doc);
    var originalOperationDefinition = utilities_1.getOperationDefinition(doc);
    var operationDefinition = utilities_1.getOperationDefinition(docWithoutDirective);
    operationDefinition.directives =
        originalOperationDefinition.directives.filter(function (node) { return node !== directive; });
    var removedVariableNames = getVariablesFromArguments(directive.arguments).map(function (v) { return v.name.value; });
    removeVariableDefinitionsFromDocumentIfUnused(removedVariableNames, docWithoutDirective);
    return docWithoutDirective;
}
exports.removeDirectiveFromDocument = removeDirectiveFromDocument;
function getAllArgumentsFromSelectionSet(selectionSet) {
    if (!selectionSet) {
        return [];
    }
    return selectionSet.selections
        .map(getAllArgumentsFromSelection)
        .reduce(function (allArguments, selectionArguments) {
        return __spreadArrays(allArguments, selectionArguments);
    }, []);
}
exports.getAllArgumentsFromSelectionSet = getAllArgumentsFromSelectionSet;
function getAllArgumentsFromSelection(selection) {
    if (!selection) {
        return [];
    }
    var args = getAllArgumentsFromDirectives(selection.directives);
    if (selection.kind === 'Field') {
        args = args.concat(selection.arguments || []);
        args = args.concat(getAllArgumentsFromSelectionSet(selection.selectionSet));
    }
    return args;
}
exports.getAllArgumentsFromSelection = getAllArgumentsFromSelection;
function getAllArgumentsFromDirectives(directives) {
    if (!directives) {
        return [];
    }
    return directives
        .map(function (d) { return d.arguments || []; })
        .reduce(function (allArguments, directiveArguments) {
        return __spreadArrays(allArguments, directiveArguments);
    }, []);
}
exports.getAllArgumentsFromDirectives = getAllArgumentsFromDirectives;
function getAllArgumentsFromDocument(doc) {
    return doc.definitions
        .map(function (def) {
        if (def.kind === 'FragmentDefinition') {
            return getAllArgumentsFromFragment(def);
        }
        else if (def.kind === 'OperationDefinition') {
            return getAllArgumentsFromOperation(def);
        }
        else {
            return [];
        }
    })
        .reduce(function (allArguments, definitionArguments) {
        return __spreadArrays(allArguments, definitionArguments);
    }, []);
}
exports.getAllArgumentsFromDocument = getAllArgumentsFromDocument;
function getAllArgumentsFromOperation(op) {
    return getAllArgumentsFromDirectives(op.directives).concat(getAllArgumentsFromSelectionSet(op.selectionSet));
}
exports.getAllArgumentsFromOperation = getAllArgumentsFromOperation;
function getAllArgumentsFromFragment(frag) {
    return getAllArgumentsFromDirectives(frag.directives).concat(getAllArgumentsFromSelectionSet(frag.selectionSet));
}
exports.getAllArgumentsFromFragment = getAllArgumentsFromFragment;
function getVariablesFromArguments(args) {
    return args
        .map(function (arg) { return getVariablesFromValueNode(arg.value); })
        .reduce(function (a, b) { return a.concat(b); }, []);
}
exports.getVariablesFromArguments = getVariablesFromArguments;
function getVariablesFromValueNode(node) {
    switch (node.kind) {
        case 'Variable':
            return [node];
        case 'ListValue':
            return node.values
                .map(getVariablesFromValueNode)
                .reduce(function (a, b) { return a.concat(b); }, []);
        case 'ObjectValue':
            return node.fields
                .map(function (f) { return f.value; })
                .map(getVariablesFromValueNode)
                .reduce(function (a, b) { return a.concat(b); }, []);
        default:
            return [];
    }
}
exports.getVariablesFromValueNode = getVariablesFromValueNode;
function removeVariableDefinitionsFromDocumentIfUnused(names, doc) {
    if (names.length < 1) {
        return;
    }
    var args = getAllArgumentsFromDocument(doc);
    var usedNames = new Set(getVariablesFromArguments(args).map(function (v) { return v.name.value; }));
    var filteredNames = new Set(names.filter(function (name) { return !usedNames.has(name); }));
    if (filteredNames.size < 1) {
        return;
    }
    var op = utilities_1.getOperationDefinition(doc);
    if (op.variableDefinitions) {
        op.variableDefinitions = op.variableDefinitions.filter(function (d) { return !filteredNames.has(d.variable.name.value); });
    }
}
exports.removeVariableDefinitionsFromDocumentIfUnused = removeVariableDefinitionsFromDocumentIfUnused;
//# sourceMappingURL=extractKey.js.map