// import { jutils } from 'base_parts';
import { C4AccessControlConfig, ACResourceMatrix, ACAuthorityVector, ACRolesAuthoritiesMatrix, ACLCache, ACLCommunicator } from './C4AccessControlTypes/C4AccessControlConfig';
import { TypeUtils } from "c4utils";
import ACLDefaultCache from './C4AccessControlUtils/ACLDefaultCache';
import _ = require('lodash');

// export type AccCtrlObj = { target: any, ctrlCfg: AccessCtrlConfig };

function LogError(logger : any, error : any) {
    if (logger) {
        logger.err ? logger.err(error) : logger.error(error);
    }
}

export default class C4AccessControl {

    private m_bInit             : boolean;
    private m_ACLCache          : ACLCache | null;
    private m_ACLCommunicator   : ACLCommunicator | null;
    private m_bDisable          : boolean;
    private m_Logger            : any | null;

    /**
     * 资源矩阵
     */
    private m_ResourcesMatrix : { [resoureceKey : string] : ACResourceMatrix } = {};

    /**
     * 静态资源的资源矩阵，加速查找过程
     */
    private m_StaticResourcesMatrix : { [resoureceKey : string] : ACResourceMatrix } = {};

    /**
     * 权限信息
     */
    private m_RolesInfo : ACRolesAuthoritiesMatrix = {};

    constructor() {
        this.m_bInit            = false;
        this.m_ACLCache         = null;
        this.m_ACLCommunicator  = null;
        this.m_bDisable         = true;
    }

    /**
     * 初始化
     * @param config C4AccessControlConfig
     */
    async init(config: C4AccessControlConfig) {

        // 防止反复初始化
        if (this.m_bInit) {
            return;
        }

        this.m_bDisable = config.disable ? true : false;
        this.m_ACLCache = config.aclCache ? config.aclCache : new ACLDefaultCache();

        if (TypeUtils.isEmptyObj(config.aclCommunicator)) {
            throw Error("C4AccessControl init need ACLCommunicator.")
        }
        this.m_ACLCommunicator  = config.aclCommunicator;
        this.m_Logger           = config.logger;

        let Res = true;
        if (this.m_ACLCache) {
            Res = await this.m_ACLCache.init();
            if (Res === false) {
                LogError(this.m_Logger, "C4AccessControl init ACL Cache failed.");
                throw Error("C4AccessControl init ACL Cache failed.");
            }
        }

        Res = await this.m_ACLCommunicator.init(config.serToken);
        if (Res === false) {
            LogError(this.m_Logger, "C4AccessControl init ACL Communicator failed.");
            throw Error("C4AccessControl init ACL Communicator failed.");
        }

        // 初始化完成
        this.m_bInit = true;
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
    addAccCtrlTarget(accCfg : ACResourceMatrix) {
        if (TypeUtils.isEmptyObj(this.m_ResourcesMatrix[accCfg.resource])) {
            this.m_ResourcesMatrix[accCfg.resource] = accCfg;
        } else {
            /** NOTE:
             * 换成lodash
             */
            _.assign(this.m_ResourcesMatrix[accCfg.resource], accCfg);
        }

        if (accCfg.staticRes === true) {
            if (TypeUtils.isEmptyObj(this.m_StaticResourcesMatrix[accCfg.resource])) {
                this.m_StaticResourcesMatrix[accCfg.resource] = accCfg;
            } else {
                _.assign(this.m_StaticResourcesMatrix[accCfg.resource], accCfg);
            }
        }
    }

    /**
     * 获取权限组
     * @param userID 用户ID
     */
    private async getUserRoles(userID : string) {
        let curRoles = [];
        try {
            let rolesStr = "";
            do {
                if (this.m_ACLCache) {
                    rolesStr = await this.m_ACLCache.getCache(`user_{${userID}}_roles`);
                    try {
                        curRoles = JSON.parse(rolesStr);
                    } catch (error) {
                        LogError(this.m_Logger, error);
                        break;
                    }
                    return curRoles;
                }
            } while (false);
            let syncRes = await (<ACLCommunicator>this.m_ACLCommunicator).syncUserRoles(userID, this.m_Logger);
            for (let index = 0; index < syncRes.length; index++) {
                if (syncRes[index].user_id === userID) {
                    curRoles.push(syncRes[index].role_name);
                }
            }
            if (this.m_ACLCache) {
                let setRes = await this.m_ACLCache.setCache(userID, JSON.stringify(curRoles));
                if (setRes === false) {
                    LogError(this.m_Logger, `Update ${userID} ACL cache failed.`);
                }
            }
        } catch (error) {
            LogError(this.m_Logger, error);
            curRoles = [];
        }

        return curRoles;
    }

    /**
     * 获取权限组动作属性
     * @param roleName 角色名
     * @param resource 资源名
     * @param action 动作
     */
    private getRolePossession(roleName: string, resource: string, action: string) {

        if (this.m_RolesInfo[roleName]
            && this.m_RolesInfo[roleName][resource]
            && (<any>this.m_RolesInfo[roleName][resource].action)[action]) {
            return {
                possession : (<any>this.m_RolesInfo[roleName][resource].action)[action].limit
            }
        }
        return {
            possession : ""
        }
    }

    /**
     * 根据资源名获取资源矩阵
     * @param resource 
     */
    getResourceConfig(resource : string) {
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
    async AccCtrlAuth(resource: string, user: string, action: string | undefined, paramUser: string | undefined): Promise<{
        role : string;
        pass : boolean;
        user?: string;
    }> {
        // 通过标记
        var retRole = "";
        var retPass = false;
        var retUser = undefined;

        // 禁用权限控制
        if (this.m_bDisable) {
            return {
                role : "",
                pass : true,
                user : paramUser
            }
        }

        if (TypeUtils.isEmptyStr(action)) {
            throw Error(`C4AccessControl AccCtrlAuth action is empty.`)
        }
        let CurAction = (<string>action).toLowerCase();
        if (CurAction !== "create"
            && CurAction !== "read"
            && CurAction !== "update"
            && CurAction !== "delete"
        ) {
            throw Error(`C4AccessControl AccCtrlAuth unknown action type : ${CurAction}`);
        }

        let roles = await this.getUserRoles(user);  // 获取用户的角色列表
        for (let i = 0; i < roles.length; i++) {
            // 进行权限判断（权限有交集的取值问题）
            let CurRole         = roles[i];
            let CurPossession   = this.getRolePossession(CurRole, resource, CurAction);
            if (CurPossession.possession === "any") {
                retRole = CurRole;
                retPass = true;
                retUser = paramUser;
            } else if (CurPossession.possession === "own") {
                if (user === paramUser) {
                    retRole = CurRole;
                    retPass = true;
                    retUser = paramUser;
                }
            }
        }

        // 鉴权结果
        return {
            role : retRole,
            pass : retPass,
            user : retUser
        };
    }


    /**
     * 上传权限矩阵
     */
    async updateAclMatrix() {

        try {
            if (this.m_Logger)
                this.m_Logger.debug(`C4AccessControl update ACL tables : ${JSON.stringify(this.m_ResourcesMatrix)}.`);
            let res = await (<ACLCommunicator>this.m_ACLCommunicator).upload("addResource", this.m_ResourcesMatrix, this.m_Logger);
            if (res === false) {
                throw Error("C4AccessControl update ACL Matrix failed.");
            }
        } catch (error) {
            LogError(this.m_Logger, error);
            throw error;
        }
    }

    /**
     * 启动
     */
    async launch() {
        if (this.m_bInit) return;

        try {
            let RoleMatrix      = await (<ACLCommunicator>this.m_ACLCommunicator).sync(this.m_Logger);
            this.m_RolesInfo    = RoleMatrix;
            // 处理权限矩阵
        } catch (error) {
            LogError(this.m_Logger, error);
            throw error;
        }
    }

    /**
     * 重置
     */
    async reset() {
        if (!this.m_bInit) return;

        this.m_bInit = false;
    }
}
