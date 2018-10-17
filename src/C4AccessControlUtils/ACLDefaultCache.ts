import { ACLCache } from "../C4AccessControlTypes/C4AccessControlConfig";

/**
 * 测试用的Cache，在内存中存储
 */
export default class ACLDefaultCache extends ACLCache {

    private m_ACLCached : { [key : string] : any};

    constructor() {
        super();
        this.m_ACLCached    = {};
    }

    async init() {
        this.m_ACLCached    = {};
        return true;
    }

    async release() {
        this.m_ACLCached    = {};
    }

    async getCache(key : string) {
        return this.m_ACLCached[key];
    }

    async setCache(key : string, value : any) {
        this.m_ACLCached[key] = value;
        return true;
    }
}