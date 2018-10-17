"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const c4utils_1 = require("c4utils");
const PathReg = require("path-to-regexp");
function processStaticACL(aclOption, logger) {
    if (c4utils_1.TypeUtils.isEmptyStr(aclOption.desc)) {
        aclOption.desc = aclOption.resource;
    }
    if (c4utils_1.TypeUtils.isEmptyObj(aclOption.action)
        || c4utils_1.TypeUtils.isEmptyArray(aclOption.action.read)) {
        aclOption.action = {
            read: ["own", "any"]
        };
    }
    else {
        aclOption.action = {
            read: aclOption.action.read
        };
    }
    let pathReg = PathReg(aclOption.resource, []);
    aclOption.staticPathReg = pathReg;
    return aclOption;
}
exports.processStaticACL = processStaticACL;
function processACL(aclOption, path, method, logger) {
    if (c4utils_1.TypeUtils.isEmptyObj(aclOption)) {
        return null;
    }
    aclOption.resource = path;
    if (c4utils_1.TypeUtils.isEmptyStr(aclOption.desc)) {
        aclOption.desc = aclOption.resource;
    }
    // 如果method不是all，则只允许有一个Action
    // 如果method是all，则允许有多个action
    let CurMethod = method.toUpperCase();
    switch (CurMethod) {
        case "GET": {
            if (c4utils_1.TypeUtils.isEmptyObj(aclOption.action)
                || c4utils_1.TypeUtils.isEmptyArray(aclOption.action.read)) {
                aclOption.action = {
                    read: ["own", "any"]
                };
            }
            else {
                aclOption.action = {
                    read: aclOption.action.read
                };
            }
            break;
        }
        case "POST": {
            if (c4utils_1.TypeUtils.isEmptyObj(aclOption.action)
                || c4utils_1.TypeUtils.isEmptyArray(aclOption.action.create)) {
                aclOption.action = {
                    create: ["own", "any"]
                };
            }
            else {
                aclOption.action = {
                    create: aclOption.action.create
                };
            }
            break;
        }
        case "PUT":
        case "PATCH": {
            if (c4utils_1.TypeUtils.isEmptyObj(aclOption.action)
                || c4utils_1.TypeUtils.isEmptyArray(aclOption.action.update)) {
                aclOption.action = {
                    update: ["own", "any"]
                };
            }
            else {
                aclOption.action = {
                    update: aclOption.action.update
                };
            }
            break;
        }
        case "DELETE": {
            if (c4utils_1.TypeUtils.isEmptyObj(aclOption.action)
                || c4utils_1.TypeUtils.isEmptyArray(aclOption.action.delete)) {
                aclOption.action = {
                    delete: ["own", "any"]
                };
            }
            else {
                aclOption.action = {
                    delete: aclOption.action.delete
                };
            }
            break;
        }
        case "ALL": {
            // 从request.method中获取当前操作类型
            if (c4utils_1.TypeUtils.isEmptyObj(aclOption.action)
                || (c4utils_1.TypeUtils.isEmptyArray(aclOption.action.delete)
                    && c4utils_1.TypeUtils.isEmptyArray(aclOption.action.read)
                    && c4utils_1.TypeUtils.isEmptyArray(aclOption.action.update)
                    && c4utils_1.TypeUtils.isEmptyArray(aclOption.action.create))) {
                aclOption.action = {
                    read: ["own", "any"],
                    create: ["own", "any"],
                    update: ["own", "any"],
                    delete: ["own", "any"]
                };
            }
            break;
        }
        default: {
            if (logger)
                logger.warn(`Process ${aclOption.resource} ACL : Unknown mehtod type : ${CurMethod}.`);
            return null;
        }
    }
    return aclOption;
}
exports.processACL = processACL;
function checkACL(acl, aclConfig, method, userID, paramUser, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        let CurAction = "";
        let CurMethod = "";
        let CheckRes = {
            role: "",
            pass: false,
            user: undefined
        };
        if (c4utils_1.TypeUtils.isEmptyStr(method)) {
            if (logger) {
                logger.warn("CheckACL failed, method type is empty.");
            }
            return CheckRes;
        }
        CurMethod = method.toUpperCase();
        switch (method) {
            case "GET": {
                CurAction = "read";
                break;
            }
            case "POST": {
                CurAction = "create";
                break;
            }
            case "PUT":
            case "PATCH": {
                CurAction = "update";
                break;
            }
            case "DELETE": {
                CurAction = "delete";
                break;
            }
            default: {
                if (logger)
                    logger.warn(`Check ${aclConfig.resource} ACL : Unknown mehtod type : ${CurMethod}.`);
                return CheckRes;
            }
        }
        if (!c4utils_1.TypeUtils.isEmptyObj(aclConfig)) {
            if (c4utils_1.TypeUtils.isEmptyStr(userID))
                return CheckRes;
        }
        let checkRes = yield acl.AccCtrlAuth(aclConfig.resource, userID, CurAction, paramUser);
        return checkRes;
    });
}
exports.checkACL = checkACL;
//# sourceMappingURL=ACLUtils.js.map