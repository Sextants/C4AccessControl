"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_parts_1 = require("base_parts");
var AuthType = 0;
var AuthStr = "Token xxxxxxxxxxxxxxxxxx";
async function setAuth(type, authObj) {
    AuthType = type;
    switch (type) {
        case 0:
            AuthStr = "Token " + authObj.AuthToken;
            break;
        default:
            break;
    }
}
exports.setAuth = setAuth;
/**
 * 获取服务信息
 * @param serName 服务名称
 */
async function getSerInfo(serName) {
    switch (serName) {
        case "ACCOUNT-SERVICE":
            return {
                apiUrl: "http://10.0.0.102:8901",
                serDesc: "账户服务"
            };
    }
    // 未找到,抛出错误
    throw new Error("getSerInfo Error nofind:" + serName);
}
exports.getSerInfo = getSerInfo;
/**
 * 获取服务器api的url
 * @param serName 服务名称
 * @param serApi 资源API
 */
async function getRestUrl(serName, serApi) {
    var curSer = await getSerInfo(serName);
    return curSer.apiUrl + serApi;
}
exports.getRestUrl = getRestUrl;
/**
 * 发送Json数据
 * @param method 动作或其他
 * @param serName 服务名称
 * @param serApi 服务接口
 * @param obj 提交的对象
 * @param opt 选项
 * @returns 返回内容
 */
async function sendJson(method, serName, serApi, obj, opt) {
    return await base_parts_1.jhttp_utils.sendEx(await getRestUrl(serName, serApi), {
        method: method.toUpperCase(),
        headers: {
            Authorization: AuthStr,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: (typeof (obj) === "string") ? obj : JSON.stringify(obj)
    }, opt);
}
exports.sendJson = sendJson;
/**
 * 发送表单数据
 * @param method 动作"POST"|"PUT"|"DELETE"或其他
 * @param serName 服务名称
 * @param serApi 服务接口
 * @param obj 提交的对象
 * @param opt 选项
 * @returns 返回内容
 */
async function sendForm(method, serName, serApi, obj, opt) {
    return await base_parts_1.jhttp_utils.sendEx(await getRestUrl(serName, serApi), {
        method: method.toUpperCase(),
        headers: {
            Authorization: AuthStr,
            "Accept": "application/json"
        },
        form: obj
    }, opt);
}
exports.sendForm = sendForm;
/**
 * 发送Multipart表单数据
 * @param method 动作"POST"|"PUT"|"DELETE"或其他
 * @param serName 服务名称
 * @param serApi 服务接口
 * @param obj 提交的对象
 * @param opt 选项
 * @returns 返回内容
 */
async function sendMultipart(method, serName, serApi, obj, opt) {
    return await base_parts_1.jhttp_utils.sendEx(await getRestUrl(serName, serApi), {
        method: method.toUpperCase(),
        headers: {
            Authorization: AuthStr,
            "Accept": "application/json"
        },
        formData: obj
    }, opt);
}
exports.sendMultipart = sendMultipart;
/**
 * GET请求数据
 * @param serName 服务名称
 * @param serApi 服务接口
 * @param obj 提交的对象(将会转换到url段)
 * @param opt 选项
 * @returns 返回内容
 */
async function getData(serName, serApi, obj, opt) {
    return await base_parts_1.jhttp_utils.sendEx(await getRestUrl(serName, serApi), {
        method: "GET",
        headers: {
            Authorization: AuthStr,
            "Accept": "application/json"
        },
        qs: obj
    }, opt);
}
exports.getData = getData;
