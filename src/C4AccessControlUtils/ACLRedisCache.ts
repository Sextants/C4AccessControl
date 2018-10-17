import { ACLCache } from "../C4AccessControlTypes/C4AccessControlConfig";
import { Redis } from "ioredis";

/**
 * Redis Cache
 */
export default class ACLRedisCache extends ACLCache {

    private m_RedisClient : Redis;

    constructor(redis : Redis) {
        super();
        this.m_RedisClient = redis;
    }

    async init() {
        if (null === this.m_RedisClient) {
            throw Error("ACLRedisCache init need a redis client.");
        }
        return true;
    }

    async release() {}

    async getCache(key : string) {
        if (null === this.m_RedisClient) {
            return "[]";
        }

        return await this.m_RedisClient.get(`user_{${key}}_roles`);
    }

    async setCache(key : string, value : any) {
        if (null === this.m_RedisClient) {
            return false;
        }
        await this.m_RedisClient.set(`user_{${key}}_roles`, JSON.stringify(value));
        return true;
    }
}