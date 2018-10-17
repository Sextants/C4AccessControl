import { C4AccessControlConfig, ACResourceMatrix } from './C4AccessControlTypes/C4AccessControlConfig';
export default class C4AccessControl {
    private m_bInit;
    private m_ACLCache;
    private m_ACLCommunicator;
    private m_bDisable;
    private m_Logger;
    /**
     * 资源矩阵
     */
    private m_ResourcesMatrix;
    /**
     * 静态资源的资源矩阵，加速查找过程
     */
    private m_StaticResourcesMatrix;
    /**
     * 权限信息
     */
    private m_RolesInfo;
    constructor();
    /**
     * 初始化
     * @param config C4AccessControlConfig
     */
    init(config: C4AccessControlConfig): Promise<void>;
    /**
     * 获取启用状态
     */
    isEnabled(): boolean;
    /**
     * 获取初始化状态
     */
    isInit(): boolean;
    /**
     * 设置权限矩阵
     * @param accCfg ACResourceMatrix
     */
    addAccCtrlTarget(accCfg: ACResourceMatrix): void;
    /**
     * 获取权限组
     * @param userID 用户ID
     */
    private getUserRoles;
    /**
     * 获取权限组动作属性
     * @param roleName 角色名
     * @param resource 资源名
     * @param action 动作
     */
    private getRolePossession;
    /**
     * 根据资源名获取资源矩阵
     * @param resource
     */
    getResourceConfig(resource: string): ACResourceMatrix;
    /**
     * 获取静态资源的资源矩阵
     */
    getStaticResourceConfigs(): {
        [resoureceKey: string]: ACResourceMatrix;
    };
    /**
     * 判断权限
     * @param resource 权限接口资源名
     * @param inObj 入参对象
     */
    AccCtrlAuth(resource: string, user: string, action: string | undefined, paramUser: string | undefined): Promise<{
        role: string;
        pass: boolean;
        user?: string;
    }>;
    /**
     * 上传权限矩阵
     */
    updateAclMatrix(): Promise<void>;
    /**
     * 启动
     */
    launch(): Promise<void>;
    /**
     * 重置
     */
    reset(): Promise<void>;
}
