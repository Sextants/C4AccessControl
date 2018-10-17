import { ACLCommunicator } from '../C4AccessControlTypes/C4AccessControlConfig';
/**
 * 用于提交和同步资源矩阵、权限矩阵的Communicator的Demo
 */
export default class ACLDemoCommunicator extends ACLCommunicator {
    private m_Token;
    private m_ServerHost;
    constructor(serverHost?: string);
    init(token?: string): Promise<boolean>;
    release(): Promise<void>;
    upload(key: string, data: any, logger: any): Promise<boolean>;
    sync(logger: any): Promise<{}>;
    syncUserRoles(userID: string, logger: any): Promise<{} | {}>;
}
