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
exports.__esModule = true;
var core_1 = require("@apollo/client/core");
var extractKey_1 = require("./extractKey");
var SerializingLink = (function (_super) {
    __extends(SerializingLink, _super);
    function SerializingLink() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.opQueues = {};
        _this.enqueue = function (key, entry) {
            if (!_this.opQueues[key]) {
                _this.opQueues[key] = [];
            }
            _this.opQueues[key].push(entry);
            if (_this.opQueues[key].length === 1) {
                _this.startFirstOpIfNotStarted(key);
            }
        };
        _this.cancelOp = function (key, entryToRemove) {
            if (!_this.opQueues[key]) {
                return;
            }
            var idx = _this.opQueues[key].findIndex(function (entry) { return entryToRemove === entry; });
            if (idx >= 0) {
                var entry = _this.opQueues[key][idx];
                if (entry.subscription) {
                    entry.subscription.unsubscribe();
                }
                _this.opQueues[key].splice(idx, 1);
            }
            _this.startFirstOpIfNotStarted(key);
        };
        _this.startFirstOpIfNotStarted = function (key) {
            if (_this.opQueues[key].length === 0) {
                delete _this.opQueues[key];
                return;
            }
            var _a = _this.opQueues[key][0], operation = _a.operation, forward = _a.forward, observer = _a.observer, subscription = _a.subscription;
            if (subscription) {
                return;
            }
            _this.opQueues[key][0].subscription = forward(operation).subscribe({
                next: function (v) { return observer.next && observer.next(v); },
                error: function (e) {
                    if (observer.error) {
                        observer.error(e);
                    }
                },
                complete: function () {
                    if (observer.complete) {
                        observer.complete();
                    }
                }
            });
        };
        return _this;
    }
    SerializingLink.prototype.request = function (origOperation, forward) {
        var _this = this;
        var _a = extractKey_1.extractKey(origOperation), operation = _a.operation, key = _a.key;
        if (!key) {
            return forward(operation);
        }
        return new core_1.Observable(function (observer) {
            var entry = { operation: operation, forward: forward, observer: observer };
            _this.enqueue(key, entry);
            return function () {
                _this.cancelOp(key, entry);
            };
        });
    };
    return SerializingLink;
}(core_1.ApolloLink));
exports["default"] = SerializingLink;
//# sourceMappingURL=SerializingLink.js.map