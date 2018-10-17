import { ACLCache } from "../C4AccessControlTypes/C4AccessControlConfig";
import { Redis } from "ioredis";
/**
 * Redis Cache
 */
export default class ACLRedisCache extends ACLCache {
    private m_RedisClient;
    constructor(redis: Redis);
    init(): Promise<boolean>;
    release(): Promise<void>;
    getCache(key: string): Promise<string>;
    setCache(key: string, value: any): Promise<boolean>;
}
