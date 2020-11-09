"use strict";
exports.__esModule = true;
exports.TokenProvider = void 0;
var parse_duration_1 = require("parse-duration");
var utilities_1 = require("../utilities");
var TokenProvider = (function () {
    function TokenProvider(config) {
        this.config = {
            uid: utilities_1.hash(config.name),
            name: config.name,
            quotas: config.quotas.map(function (q, i) {
                return {
                    uid: utilities_1.hash(config.name + "-q-" + i),
                    numberOfRequests: q.numberOfRequests,
                    duration: parse_duration_1["default"](q.duration)
                };
            })
        };
        this.storage = config.storage;
        this.storage.configureStorage(this.config.uid, this.config.quotas);
    }
    TokenProvider.prototype.getToken = function (token) {
        return this.storage.getToken(token);
    };
    return TokenProvider;
}());
exports.TokenProvider = TokenProvider;
//# sourceMappingURL=index.js.map