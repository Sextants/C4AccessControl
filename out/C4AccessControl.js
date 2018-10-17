"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const c4utils_1 = require("c4utils");
const ACLDefaultCache_1 = __importDefault(require("./C4AccessControlUtils/ACLDefaultCache"));
const _ = require("lodash");
// export type AccCtrlObj = { target: any, ctrlCfg: AccessCtrlConfig };
function LogError(logger, error) {
    if (logger) {
        logger.err ? logger.err(error) : logger.error(error);
    }
}
class C4AccessControl {
    constructor() {
        /**
         * 资源矩阵
         */
        this.m_ResourcesMatrix = {};
        /**
         * 静态资源的资源矩阵，加速查找过程
         */
        this.m_StaticResourcesMatrix = {};
        /**
         * 权限信息
         */
        this.m_RolesInfo = {};
        this.m_bInit = false;
        this.m_ACLCache = null;
        this.m_ACLCommunicator = null;
        this.m_bDisable = true;
    }
    /**
     * 初始化
     * @param config C4AccessControlConfig
     */
    init(config) {
        return __awaiter(this, void 0, void 0, function* () {
            // 防止反复初始化
            if (this.m_bInit) {
                return;
            }
            this.m_bDisable = config.disable ? true : false;
            this.m_ACLCache = config.aclCache ? config.aclCache : new ACLDefaultCache_1.default();
            if (c4utils_1.TypeUtils.isEmptyObj(config.aclCommunicator)) {
                throw Error("C4AccessControl init need ACLCommunicator.");
            }
            this.m_ACLCommunicator = config.aclCommunicator;
            this.m_Logger = config.logger;
            let Res = true;
            if (this.m_ACLCache) {
                Res = yield this.m_ACLCache.init();
                if (Res === false) {
                    LogError(this.m_Logger, "C4AccessControl init ACL Cache failed.");
                    throw Error("C4AccessControl init ACL Cache failed.");
                }
            }
            Res = yield this.m_ACLCommunicator.init(config.serToken);
            if (Res === false) {
                LogError(this.m_Logger, "C4AccessControl init ACL Communicator failed.");
                throw Error("C4AccessControl init ACL Communicator failed.");
            }
            // 初始化完成
            this.m_bInit = true;
        });
    }
    /**
     * 获取启用状态
     */
    isEnabled() {
        return !this.m_bDisable;
    }
    /**
     * 获取初始化状态
     */
    isInit() {
        return this.m_bInit;
    }
    /**
     * 设置权限矩阵
     * @param accCfg ACResourceMatrix
     */
    addAccCtrlTarget(accCfg) {
        if (c4utils_1.TypeUtils.isEmptyObj(this.m_ResourcesMatrix[accCfg.resource])) {
            this.m_ResourcesMatrix[accCfg.resource] = accCfg;
        }
        else {
            /** NOTE:
             * 换成lodash
             */
            _.assign(this.m_ResourcesMatrix[accCfg.resource], accCfg);
        }
        if (accCfg.staticRes === true) {
            if (c4utils_1.TypeUtils.isEmptyObj(this.m_StaticResourcesMatrix[accCfg.resource])) {
                this.m_StaticResourcesMatrix[accCfg.resource] = accCfg;
            }
            else {
                _.assign(this.m_StaticResourcesMatrix[accCfg.resource], accCfg);
            }
        }
    }
    /**
     * 获取权限组
     * @param userID 用户ID
     */
    getUserRoles(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            let curRoles = [];
            try {
                let rolesStr = "";
                do {
                    if (this.m_ACLCache) {
                        rolesStr = yield this.m_ACLCache.getCache(`user_{${userID}}_roles`);
                        try {
                            curRoles = JSON.parse(rolesStr);
                        }
                        catch (error) {
                            LogError(this.m_Logger, error);
                            break;
                        }
                        return curRoles;
                    }
                } while (false);
                let syncRes = yield this.m_ACLCommunicator.syncUserRoles(userID, this.m_Logger);
                for (let index = 0; index < syncRes.length; index++) {
                    if (syncRes[index].user_id === userID) {
                        curRoles.push(syncRes[index].role_name);
                    }
                }
                if (this.m_ACLCache) {
                    let setRes = yield this.m_ACLCache.setCache(userID, JSON.stringify(curRoles));
                    if (setRes === false) {
                        LogError(this.m_Logger, `Update ${userID} ACL cache failed.`);
                    }
                }
            }
            catch (error) {
                LogError(this.m_Logger, error);
                curRoles = [];
            }
            return curRoles;
        });
    }
    /**
     * 获取权限组动作属性
     * @param roleName 角色名
     * @param resource 资源名
     * @param action 动作
     */
    getRolePossession(roleName, resource, action) {
        if (this.m_RolesInfo[roleName]
            && this.m_RolesInfo[roleName][resource]
            && this.m_RolesInfo[roleName][resource].action[action]) {
            return {
                possession: this.m_RolesInfo[roleName][resource].action[action].limit
            };
        }
        return {
            possession: ""
        };
    }
    /**
     * 根据资源名获取资源矩阵
     * @param resource
     */
    getResourceConfig(resource) {
        return this.m_ResourcesMatrix[resource];
    }
    /**
     * 获取静态资源的资源矩阵
     */
    getStaticResourceConfigs() {
        return this.m_StaticResourcesMatrix;
    }
    /**
     * 判断权限
     * @param resource 权限接口资源名
     * @param inObj 入参对象
     */
    AccCtrlAuth(resource, user, action, paramUser) {
        return __awaiter(this, void 0, void 0, function* () {
            // 通过标记
            var retRole = "";
            var retPass = false;
            var retUser = undefined;
            // 禁用权限控制
            if (this.m_bDisable) {
                return {
                    role: "",
                    pass: true,
                    user: paramUser
                };
            }
            if (c4utils_1.TypeUtils.isEmptyStr(action)) {
                throw Error(`C4AccessControl AccCtrlAuth action is empty.`);
            }
            let CurAction = action.toLowerCase();
            if (CurAction !== "create"
                && CurAction !== "read"
                && CurAction !== "update"
                && CurAction !== "delete") {
                throw Error(`C4AccessControl AccCtrlAuth unknown action type : ${CurAction}`);
            }
            let roles = yield this.getUserRoles(user); // 获取用户的角色列表
            for (let i = 0; i < roles.length; i++) {
                // 进行权限判断（权限有交集的取值问题）
                let CurRole = roles[i];
                let CurPossession = this.getRolePossession(CurRole, resource, CurAction);
                if (CurPossession.possession === "any") {
                    retRole = CurRole;
                    retPass = true;
                    retUser = paramUser;
                }
                else if (CurPossession.possession === "own") {
                    if (user === paramUser) {
                        retRole = CurRole;
                        retPass = true;
                        retUser = paramUser;
                    }
                }
            }
            // 鉴权结果
            return {
                role: retRole,
                pass: retPass,
                user: retUser
            };
        });
    }
    /**
     * 上传权限矩阵
     */
    updateAclMatrix() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.m_Logger)
                    this.m_Logger.debug(`C4AccessControl update ACL tables : ${JSON.stringify(this.m_ResourcesMatrix)}.`);
                let res = yield this.m_ACLCommunicator.upload("addResource", this.m_ResourcesMatrix, this.m_Logger);
                if (res === false) {
                    throw Error("C4AccessControl update ACL Matrix failed.");
                }
            }
            catch (error) {
                LogError(this.m_Logger, error);
                throw error;
            }
        });
    }
    /**
     * 启动
     */
    launch() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.m_bInit)
                return;
            try {
                let RoleMatrix = yield this.m_ACLCommunicator.sync(this.m_Logger);
                this.m_RolesInfo = RoleMatrix;
                // 处理权限矩阵
            }
            catch (error) {
                LogError(this.m_Logger, error);
                throw error;
            }
        });
    }
    /**
     * 重置
     */
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.m_bInit)
                return;
            this.m_bInit = false;
        });
    }
}
exports.default = C4AccessControl;
//# sourceMappingURL=C4AccessControl.js.map