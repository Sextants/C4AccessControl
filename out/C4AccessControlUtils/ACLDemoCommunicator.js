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
// import { CoreOptions } from 'request'
// import { jhttp_utils } from 'base_parts'
const C4AccessControlConfig_1 = require("../C4AccessControlTypes/C4AccessControlConfig");
const c4utils_1 = require("c4utils");
const request = require("request");
// type methodType = "POST" | "PUT" | "DELETE";
// type authStdType = {
//     AuthToken: string
// }
// const DemoServerHost = "http://10.0.0.102:8901";
/**
 * 用于提交和同步资源矩阵、权限矩阵的Communicator的Demo
 */
class ACLDemoCommunicator extends C4AccessControlConfig_1.ACLCommunicator {
    constructor(serverHost) {
        super();
        this.m_Token = "";
        this.m_ServerHost = "http://10.0.0.102:30011";
        if (!c4utils_1.TypeUtils.isEmptyStr(serverHost)) {
            this.m_ServerHost = serverHost;
        }
    }
    init(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (c4utils_1.TypeUtils.isEmptyStr(token)) {
                throw Error("ACLDemoCommunicator init need a token string.");
            }
            this.m_Token = "Token" + token;
            return true;
        });
    }
    release() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    upload(key, data, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            // 转换为接口需要的格式
            let CurResources = data;
            let UploadResources = [];
            let Keys = Object.keys(CurResources);
            for (let i = 0; i < Keys.length; i++) {
                let CurConfig = CurResources[Keys[i]];
                UploadResources.push({
                    resource: CurConfig.resource,
                    desc: CurConfig.desc,
                    action: CurConfig.action,
                    group: CurConfig.group
                });
            }
            let Res = yield new Promise((resolve, reject) => {
                request({
                    uri: this.m_ServerHost + "/auth/add_resources",
                    method: "POST",
                    headers: {
                        Authorization: this.m_Token,
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        'Content-Length': Buffer.byteLength(JSON.stringify(UploadResources)),
                    },
                    json: UploadResources,
                    timeout: 30000,
                    encoding: null,
                    pool: {
                        maxSockets: 0
                    }
                }, (err, reponse, body) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(body);
                });
            }).catch((err) => {
                if (logger) {
                    logger.err ? logger.err(err) : logger.error(err);
                }
                return false;
            });
            if (Res === false)
                return false;
            return true;
        });
    }
    sync(logger) {
        return __awaiter(this, void 0, void 0, function* () {
            let Res = yield new Promise((resolve, reject) => {
                request({
                    uri: this.m_ServerHost + "/auth/get_role_matrix",
                    method: "GET",
                    headers: {
                        Authorization: this.m_Token,
                        "Accept": "application/json"
                    },
                    timeout: 30000,
                    encoding: null,
                    pool: {
                        maxSockets: 0
                    }
                }, (err, reponse, body) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(body.toString());
                });
            }).catch((err) => {
                if (logger) {
                    logger.err ? logger.err(err) : logger.error(err);
                }
                return {};
            });
            if (c4utils_1.TypeUtils.isEmptyObj(Res))
                return Res;
            try {
                Res = JSON.parse(Res.toString());
                if (c4utils_1.TypeUtils.isEmptyArray(Res.data)) {
                    return {};
                }
                let RoleInfos = {};
                for (let i = 0; i < Res.data.length; i++) {
                    let CurRoleInfo = Res.data[i];
                    let CurRoleName = CurRoleInfo.name;
                    let CurACLInfos = CurRoleInfo.resources;
                    RoleInfos[CurRoleName] = {};
                    for (let j = 0; j < CurACLInfos.length; j++) {
                        let CurResource = CurACLInfos[j];
                        let CurResourceName = CurResource.location;
                        RoleInfos[CurRoleName][CurResourceName] = CurResource;
                    }
                }
                Res = RoleInfos;
            }
            catch (error) {
                if (logger) {
                    logger.err ? logger.err(error) : logger.error(error);
                }
                Res = {};
            }
            return Res;
        });
    }
    syncUserRoles(userID, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            let Res = yield new Promise((resolve, reject) => {
                request({
                    uri: this.m_ServerHost + "/auth/get_user_roles",
                    method: "GET",
                    headers: {
                        Authorization: this.m_Token,
                        "Accept": "application/json"
                    },
                    qs: {
                        user_id: userID
                    },
                    timeout: 30000,
                    encoding: null,
                    pool: {
                        maxSockets: 0
                    }
                }, (err, reponse, body) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(body.toString());
                });
            }).catch((err) => {
                if (logger) {
                    logger.err ? logger.err(err) : logger.error(err);
                }
                return {};
            });
            if (c4utils_1.TypeUtils.isEmptyObj(Res))
                return Res;
            try {
                Res = JSON.parse(Res.toString());
            }
            catch (error) {
                if (logger) {
                    logger.err ? logger.err(error) : logger.error(error);
                }
                Res = {};
            }
            return Res;
        });
    }
}
exports.default = ACLDemoCommunicator;
// var AuthType = 0;
// var AuthStr = "Token xxxxxxxxxxxxxxxxxx";
// export async function setAuth(type: number, authObj: authStdType) {
//     AuthType = type;
//     switch (type) {
//         case 0:
//             AuthStr = "Token " + authObj.AuthToken;
//             break;
//         default:
//             break;
//     }
// }
// /**
//  * 获取服务信息
//  * @param serName 服务名称
//  */
// export async function getSerInfo(serName: string) {
//     switch (serName) {
//         case "ACCOUNT-SERVICE":
//             return {
//                 apiUrl: "http://10.0.0.102:8901", // 服务api,末尾不带斜线
//                 serDesc: "账户服务"
//             }
//     }
//     // 未找到,抛出错误
//     throw new Error("getSerInfo Error nofind:" + serName);
// }
// /**
//  * 获取服务器api的url
//  * @param serName 服务名称
//  * @param serApi 资源API
//  */
// export async function getRestUrl(serName: string, serApi: string) {
//     var curSer = await getSerInfo(serName);
//     return curSer.apiUrl + serApi;
// }
// /**
//  * 发送Json数据
//  * @param method 动作或其他
//  * @param serName 服务名称
//  * @param serApi 服务接口
//  * @param obj 提交的对象
//  * @param opt 选项
//  * @returns 返回内容
//  */
// export async function sendJson(method: methodType, serName: string, serApi: string, obj: any, opt?: CoreOptions) {
//     return await jhttp_utils.sendEx(await getRestUrl(serName, serApi), {
//         method: method.toUpperCase(),
//         headers: {
//             Authorization: AuthStr,
//             "Accept": "application/json",
//             "Content-Type": "application/json"
//         },
//         body: (typeof (obj) === "string") ? obj : JSON.stringify(obj)
//     }, opt);
// }
// /**
//  * 发送表单数据
//  * @param method 动作"POST"|"PUT"|"DELETE"或其他
//  * @param serName 服务名称
//  * @param serApi 服务接口
//  * @param obj 提交的对象
//  * @param opt 选项
//  * @returns 返回内容
//  */
// export async function sendForm(method: methodType, serName: string, serApi: string, obj: any, opt?: CoreOptions) {
//     return await jhttp_utils.sendEx(await getRestUrl(serName, serApi), {
//         method: method.toUpperCase(),
//         headers: {
//             Authorization: AuthStr,
//             "Accept": "application/json"
//         },
//         form: obj
//     }, opt);
// }
// /**
//  * 发送Multipart表单数据
//  * @param method 动作"POST"|"PUT"|"DELETE"或其他
//  * @param serName 服务名称
//  * @param serApi 服务接口
//  * @param obj 提交的对象
//  * @param opt 选项
//  * @returns 返回内容
//  */
// export async function sendMultipart(method: methodType, serName: string, serApi: string, obj: any, opt?: CoreOptions) {
//     return await jhttp_utils.sendEx(await getRestUrl(serName, serApi), {
//         method: method.toUpperCase(),
//         headers: {
//             Authorization: AuthStr,
//             "Accept": "application/json"
//         },
//         formData: obj
//     }, opt);
// }
// /**
//  * GET请求数据
//  * @param serName 服务名称
//  * @param serApi 服务接口
//  * @param obj 提交的对象(将会转换到url段)
//  * @param opt 选项
//  * @returns 返回内容
//  */
// export async function getData(serName: string, serApi: string, obj: any, opt?: CoreOptions) {
//     return await jhttp_utils.sendEx(await getRestUrl(serName, serApi), {
//         method: "GET",
//         headers: {
//             Authorization: AuthStr,
//             "Accept": "application/json"
//         },
//         qs: obj
//     }, opt);
// }
//# sourceMappingURL=ACLDemoCommunicator.js.map