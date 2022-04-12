"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.__esModule = true;
exports.assertObservableSequence = exports.toResultValue = exports.mergeObservables = exports.TestSequenceLink = exports.TestLink = void 0;
var core_1 = require("@apollo/client/core");
var TestLink = (function (_super) {
    __extends(TestLink, _super);
    function TestLink() {
        var _this = _super.call(this) || this;
        _this.operations = [];
        return _this;
    }
    TestLink.prototype.request = function (operation) {
        this.operations.push(operation);
        return new core_1.Observable(function (observer) {
            if (operation.getContext().testError) {
                setTimeout(function () { return observer.error(operation.getContext().testError); }, 0);
                return;
            }
            setTimeout(function () { return observer.next(operation.getContext().testResponse); }, 0);
            setTimeout(function () { return observer.complete(); }, 0);
        });
    };
    return TestLink;
}(core_1.ApolloLink));
exports.TestLink = TestLink;
var TestSequenceLink = (function (_super) {
    __extends(TestSequenceLink, _super);
    function TestSequenceLink() {
        var _this = _super.call(this) || this;
        _this.operations = [];
        return _this;
    }
    TestSequenceLink.prototype.request = function (operation, forward) {
        if (!operation.getContext().testSequence) {
            return forward(operation);
        }
        this.operations.push(operation);
        return new core_1.Observable(function (observer) {
            operation.getContext().testSequence.forEach(function (event) {
                if (event.type === 'error') {
                    setTimeout(function () { return observer.error(event.value); }, event.delay || 0);
                    return;
                }
                if (event.type === 'next') {
                    setTimeout(function () { return observer.next(event.value); }, event.delay || 0);
                }
                if (event.type === 'complete') {
                    setTimeout(function () { return observer.complete(); }, event.delay || 0);
                }
            });
        });
    };
    return TestSequenceLink;
}(core_1.ApolloLink));
exports.TestSequenceLink = TestSequenceLink;
function mergeObservables() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    return new core_1.Observable(function (observer) {
        var numObservables = observables.length;
        var completedObservables = 0;
        observables.forEach(function (o) {
            o.subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: function () {
                    completedObservables++;
                    if (completedObservables === numObservables) {
                        observer.complete();
                    }
                }
            });
        });
    });
}
exports.mergeObservables = mergeObservables;
function toResultValue(e) {
    var obj = __assign({}, e);
    delete obj.delay;
    return obj;
}
exports.toResultValue = toResultValue;
exports.assertObservableSequence = function (observable, sequence, initializer) {
    if (initializer === void 0) { initializer = function () { return undefined; }; }
    var index = 0;
    if (sequence.length === 0) {
        throw new Error('Observable sequence must have at least one element');
    }
    return new Promise(function (resolve) {
        var sub = observable.subscribe({
            next: function (value) {
                expect({ type: 'next', value: value }).toEqual(sequence[index]);
                index++;
                if (index === sequence.length) {
                    resolve(true);
                }
            },
            error: function (value) {
                expect({ type: 'error', value: value }).toEqual(sequence[index]);
                index++;
                expect(undefined).toEqual(sequence[index]);
                resolve(true);
            },
            complete: function () {
                expect({ type: 'complete' }).toEqual(sequence[index]);
                index++;
                expect(undefined).toEqual(sequence[index]);
                resolve(true);
            }
        });
        initializer(sub);
    });
};
//# sourceMappingURL=TestUtils.js.map