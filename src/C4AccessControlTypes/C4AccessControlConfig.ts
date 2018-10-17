import { Redis } from "ioredis";

export abstract class ACLCache {
    abstract async init() : Promise<boolean>;
    abstract async release() : Promise<void>;
    abstract async getCache(key : string) : Promise<any>;
    abstract async setCache(key : string, value : any) : Promise<boolean>;
}

export abstract class ACLCommunicator {
    abstract async init(config : any) : Promise<boolean>;
    abstract async release() : Promise<void>;
    abstract async upload(key : string, data : any, logger : any) : Promise<boolean>;
    abstract async sync(logger : any) : Promise<any>;
    abstract async syncUserRoles(userID : string, logger : any) : Promise<any>;
}

export interface C4AccessControlConfig {

    disable    ?: boolean;
    // redisClient : Redis;
    // amqpClient  :  AMQPClient;
    logger     ?: any;
    serToken    : string;
    aclCache   ?: ACLCache;
    aclCommunicator : ACLCommunicator;
};


export type actionOp = Array<"any" | "own">;

/**
 * 资源矩阵配置信息
 */
export interface ACResourceMatrix {
    /**
     * 最终会设置为path
     * TODO: 该处设计不合理，不应该设置为path，应该为资源名或ID
     * 增加一个对象来存储包含路径的向量
     */
    resource: string;
    /**
     * 显示名称(省略将为resource)
     */
    desc?: string;

    /**
     * 分组信息（默认值是空字符串）
     */
    group ?: string;

    /**
     * TODO: 这个desc是用于构建UI时给用户展示使用，
     * 需要与Java端的实现沟通，并在档案（账户/权限）服务中增加该列的记录
     */
    groupDesc?: string;

    /**
     * 操作(省略将为动作默认方法，如GET对应read)
     * TODO: 这里的desc是对action的描述，用于构建UI时给用户展示使用
     * 需要与Java端的实现沟通，并在档案（账户/权限）服务中增加该列的记录
     */
    action?: {
        create ?: actionOp;
        read   ?: actionOp;
        update ?: actionOp;
        delete ?: actionOp;
        createDesc ?: string;
        readDesc   ?: string;
        updateDesc ?: string;
        deleteDesc ?: string;
    };

    // 查询条件上表示用户标识的参数名
    paramUser  ?: string;

    // body体上表示用户表示的属性名
    bodyUser   ?: string;

    // 后置过滤配置
    /**
     * TODO: 后置过滤的配置
     */
    filters    ?: any;

    // 是否是静态资源的ACL
    staticRes  ?: boolean;

    // 静态资源ACL的path匹配正则
    staticPathReg ?: RegExp;
};

/**
 * 权限控制信息（权限向量）
 */
export interface ACAuthorityVector 
{
    // action: {
    //     create  ?: "own" | "any";
    //     read    ?: "own" | "any";
    //     update  ?: "own" | "any";
    //     delete  ?: "own" | "any";
    // },
    /**
     * TODO: 这里的desc是对action的描述，用于构建UI时给用户展示使用
     * 需要与Java端的实现沟通，并在档案（账户/权限）服务中增加该列的记录
     */
    action : {
        create ?: {
            limit   : "own" | "any";
            id      : number;
            desc    ?: string;
        };
        read ?: {
            limit   : "own" | "any";
            id      : number;
            desc   ?: string;
        };
        update ?: {
            limit   : "own" | "any";
            id      : number;
            desc   ?: string;
        };
        delete ?: {
            limit   : "own" | "any";
            id      : number;
            desc   ?: string;
        };
    };
    location : string;
    desc    ?: string;
    groups   : string;
    /**
     * TODO: 这个desc是用于构建UI时给用户展示使用，
     * 需要与Java端的实现沟通，并在档案（账户/权限）服务中增加该列的记录
     */
    groupDesc?: string;
}

/**
 * 角色的权限矩阵
 */
export interface ACRolesAuthoritiesMatrix { [roleName: string]: { [resource: string]: ACAuthorityVector } }

/**
 * ACL的配置信息
 * 用于存储通过注解生成的资源矩阵
 */
export interface ACLOptions {
    [key : string] : ACResourceMatrix
};

