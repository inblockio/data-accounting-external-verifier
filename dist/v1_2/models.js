"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultStatusEnum = void 0;
exports.getTimestampDirect = getTimestampDirect;
exports.getTimestampSafe = getTimestampSafe;
// Method 1: Direct access when you're sure of the structure
function getTimestampDirect(pageData) {
    if (pageData.pages.length > 0) {
        const firstPage = pageData.pages[0];
        const firstRevisionKey = Object.keys(firstPage.revisions)[0];
        return firstPage.revisions[firstRevisionKey].metadata.time_stamp;
    }
    return undefined;
}
// Method 2: Safe access with optional chaining
function getTimestampSafe(pageData) {
    var _a, _b, _c;
    return (_c = (_a = pageData.pages[0]) === null || _a === void 0 ? void 0 : _a.revisions[Object.keys(((_b = pageData.pages[0]) === null || _b === void 0 ? void 0 : _b.revisions) || {})[0]]) === null || _c === void 0 ? void 0 : _c.metadata.time_stamp;
}
var ResultStatusEnum;
(function (ResultStatusEnum) {
    ResultStatusEnum[ResultStatusEnum["MISSING"] = 0] = "MISSING";
    ResultStatusEnum[ResultStatusEnum["AVAILABLE"] = 1] = "AVAILABLE";
})(ResultStatusEnum || (exports.ResultStatusEnum = ResultStatusEnum = {}));
