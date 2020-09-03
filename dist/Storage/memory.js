"use strict";
exports.__esModule = true;
exports.MemoryStorageProvider = void 0;
var Token_1 = require("../Token");
var utilities_1 = require("../utilities");
var MemoryStorageProvider = (function () {
    function MemoryStorageProvider() {
        this.tokens = [];
        this.quotaUsage = [];
    }
    MemoryStorageProvider.prototype.configureStorage = function (providerUID, quotas) {
        this.providerUID = providerUID;
        this.qutoas = quotas;
    };
    MemoryStorageProvider.prototype.getToken = function (token) {
        var uid = utilities_1.hash(token);
        var foundToken = this.tokens.find(function (t) { return t.uid === uid; });
        if (foundToken) {
            return foundToken;
        }
        var newToken = new Token_1.Token(uid, token, this);
        this.tokens.push(newToken);
        var quotaUsage = {
            tokenUid: uid,
            quotas: this.qutoas.map(function (q) {
                return {
                    quotaUid: q.uid,
                    usedRequests: 0
                };
            })
        };
        this.quotaUsage.push(quotaUsage);
        return newToken;
    };
    MemoryStorageProvider.prototype.tokenCanBeUsed = function (token) {
        var _this = this;
        return new Promise(function (res, rej) {
            var interval = setInterval(function () {
                if (_this.checkQuotas(token)) {
                    clearInterval(interval);
                    res();
                }
            }, Math.random() * 20);
        });
    };
    MemoryStorageProvider.prototype.tokenBeingUsed = function (token) {
        var quotaUsage = this.quotaUsage.find(function (q) { return q.tokenUid === token.uid; });
        if (!quotaUsage) {
            throw new Error("Failed to find Quota Usage item");
        }
        this.qutoas.forEach(function (quota) {
            var usage = quotaUsage.quotas.find(function (q) { return q.quotaUid === quota.uid; });
            if (!usage) {
                throw new Error("Failed to find usage item");
            }
            ++usage.usedRequests;
            setTimeout(function () {
                --usage.usedRequests;
            }, quota.duration);
        });
    };
    MemoryStorageProvider.prototype.checkQuotas = function (token) {
        var _this = this;
        var quotaUsage = this.quotaUsage.find(function (q) { return q.tokenUid === token.uid; });
        if (!quotaUsage) {
            throw new Error("Failed to find Quota Usage item");
        }
        var flags = quotaUsage.quotas.map(function (q) {
            var quota = _this.qutoas.find(function (qu) { return qu.uid === q.quotaUid; });
            if (!quota) {
                throw new Error("Quota not found for usage");
            }
            if (q.usedRequests < quota.numberOfRequests) {
                return true;
            }
            return false;
        });
        if (!flags.includes(false)) {
            return true;
        }
        return false;
    };
    return MemoryStorageProvider;
}());
exports.MemoryStorageProvider = MemoryStorageProvider;
//# sourceMappingURL=memory.js.map