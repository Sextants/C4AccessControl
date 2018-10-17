import { ACResourceMatrix } from "../C4AccessControlTypes/C4AccessControlConfig";
import { TypeUtils } from "c4utils";
import { C4AccessControl } from "..";
import PathReg = require('path-to-regexp');

export function processStaticACL(aclOption : ACResourceMatrix, logger : any) {
    if (TypeUtils.isEmptyStr(aclOption.desc)) {
        aclOption.desc = aclOption.resource;
    }
    if (TypeUtils.isEmptyObj(aclOption.action)
        || TypeUtils.isEmptyArray((<any>aclOption.action).read)) {
        aclOption.action = {
            read : ["own", "any"]
        }
    } else {
        aclOption.action = {
            read : (<any>aclOption.action).read
        }
    }

    let pathReg = PathReg(aclOption.resource, []);
    aclOption.staticPathReg = pathReg;
    return aclOption;
}

export function processACL(aclOption : ACResourceMatrix, path : string, method : string, logger : any) {
    if (TypeUtils.isEmptyObj(aclOption)) {
        return null;
    }
    aclOption.resource = path;
    if (TypeUtils.isEmptyStr(aclOption.desc)) {
        aclOption.desc  = aclOption.resource;
    }

    // 如果method不是all，则只允许有一个Action
    // 如果method是all，则允许有多个action
    let CurMethod = method.toUpperCase();
    switch (CurMethod) {
        case "GET" : {
            if (TypeUtils.isEmptyObj(aclOption.action)
                || TypeUtils.isEmptyArray((<any>aclOption.action).read)) {
                aclOption.action = {
                    read : ["own", "any"]
                }
            } else {
                aclOption.action = {
                    read : (<any>aclOption.action).read
                }
            }
            break;
        }
        case "POST" : {
            if (TypeUtils.isEmptyObj(aclOption.action)
                || TypeUtils.isEmptyArray((<any>aclOption.action).create)) {
                aclOption.action = {
                    create : ["own", "any"]
                }
            } else {
                aclOption.action = {
                    create : (<any>aclOption.action).create
                }
            }
            break;
        }
        case "PUT" : 
        case "PATCH" : {
            if (TypeUtils.isEmptyObj(aclOption.action)
                || TypeUtils.isEmptyArray((<any>aclOption.action).update)) {
                aclOption.action = {
                    update : ["own", "any"]
                }
            } else {
                aclOption.action = {
                    update : (<any>aclOption.action).update
                }
            }
            break;
        }
        case "DELETE" : {
            if (TypeUtils.isEmptyObj(aclOption.action)
                || TypeUtils.isEmptyArray((<any>aclOption.action).delete)) {
                aclOption.action = {
                    delete : ["own", "any"]
                }
            } else {
                aclOption.action = {
                    delete : (<any>aclOption.action).delete
                }
            }
            break;
        }
        case "ALL" : {
            // 从request.method中获取当前操作类型
            if (TypeUtils.isEmptyObj(aclOption.action)
                || (TypeUtils.isEmptyArray((<any>aclOption.action).delete)
                && TypeUtils.isEmptyArray((<any>aclOption.action).read)
                && TypeUtils.isEmptyArray((<any>aclOption.action).update)
                && TypeUtils.isEmptyArray((<any>aclOption.action).create)
            )) {
                aclOption.action = {
                    read   : ["own", "any"],
                    create : ["own", "any"],
                    update : ["own", "any"],
                    delete : ["own", "any"]
                }
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

export async function checkACL(acl : C4AccessControl, aclConfig : ACResourceMatrix, method : string, userID : string, paramUser : string, logger : any) {
    let CurAction = "";
    let CurMethod = "";
    let CheckRes  = {
        role : "",
        pass : false,
        user : undefined
    };
    if (TypeUtils.isEmptyStr(method)) {
        if (logger) {
            logger.warn("CheckACL failed, method type is empty.");
        }
        return CheckRes;
    }
    CurMethod = method.toUpperCase();
    switch (method) {
        case "GET" : {
            CurAction = "read";
            break;
        }
        case "POST": {
            CurAction = "create";
            break;
        }
        case "PUT" :
        case "PATCH" : {
            CurAction = "update";
            break;
        }
        case "DELETE" : {
            CurAction = "delete";
            break;
        }
        default : {
            if (logger)
                logger.warn(`Check ${aclConfig.resource} ACL : Unknown mehtod type : ${CurMethod}.`);
            return CheckRes;
        }
    }
    if (!TypeUtils.isEmptyObj(aclConfig)) {
        if (TypeUtils.isEmptyStr(userID))
            return CheckRes;
    }

    let checkRes = await acl.AccCtrlAuth(aclConfig.resource, userID, CurAction, paramUser);
    return checkRes;
}

