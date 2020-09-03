"use strict";
exports.__esModule = true;
exports.hash = void 0;
var crypto = require("crypto");
exports.hash = function (str) {
    return crypto.createHash("sha1").update(str).digest("base64");
};
//# sourceMappingURL=index.js.map