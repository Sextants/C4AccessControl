"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const c4utils_1 = require("c4utils");
const ACL_OPTIONS_KEY = "c4accesscontrol:access_ctrl_options";
const ACL_STATIC_OPTIONS_KEY = "c4accesscontrol:access_ctrl_static_options";
function getACLMetaOption(target) {
    let CurOpt = Reflect.getMetadata(ACL_OPTIONS_KEY, target);
    if (c4utils_1.TypeUtils.isEmptyObj(CurOpt)) {
        CurOpt = {};
        Reflect.defineMetadata(ACL_OPTIONS_KEY, CurOpt, target);
    }
    return CurOpt;
}
exports.getACLMetaOption = getACLMetaOption;
function getACLStaticMetaOption(target) {
    let CurOpt = Reflect.getMetadata(ACL_STATIC_OPTIONS_KEY, target);
    if (c4utils_1.TypeUtils.isEmptyObj(CurOpt)) {
        CurOpt = {};
        Reflect.defineMetadata(ACL_STATIC_OPTIONS_KEY, CurOpt, target);
    }
    return CurOpt;
}
exports.getACLStaticMetaOption = getACLStaticMetaOption;
function ACL(config) {
    return function (target, key, descriptor) {
        let CurOpt = config;
        CurOpt.resource = config.resource ? (config.resource) : "";
        CurOpt.desc = config.desc ? (config.desc) : "";
        CurOpt.group = config.group ? (config.group) : "";
        if (c4utils_1.TypeUtils.isUndefined(config.staticRes)) {
            CurOpt.staticRes = false;
        }
        else {
            CurOpt.staticRes = config.staticRes;
        }
        let CurACLOpt;
        if (CurOpt.staticRes === false)
            CurACLOpt = getACLMetaOption(target);
        else
            CurACLOpt = getACLStaticMetaOption(target);
        CurACLOpt[key] = CurOpt;
    };
}
exports.ACL = ACL;
//# sourceMappingURL=ACL.js.map