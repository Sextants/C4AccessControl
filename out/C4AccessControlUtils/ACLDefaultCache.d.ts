import { ACLCache } from "../C4AccessControlTypes/C4AccessControlConfig";
/**
 * 测试用的Cache，在内存中存储
 */
export default class ACLDefaultCache extends ACLCache {
    private m_ACLCached;
    constructor();
    init(): Promise<boolean>;
    release(): Promise<void>;
    getCache(key: string): Promise<any>;
    setCache(key: string, value: any): Promise<boolean>;
}
