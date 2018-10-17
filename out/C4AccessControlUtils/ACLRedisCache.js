"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const C4AccessControlConfig_1 = require("../C4AccessControlTypes/C4AccessControlConfig");
/**
 * Redis Cache
 */
class ACLRedisCache extends C4AccessControlConfig_1.ACLCache {
    constructor(redis) {
        super();
        this.m_RedisClient = redis;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (null === this.m_RedisClient) {
                throw Error("ACLRedisCache init need a redis client.");
            }
            return true;
        });
    }
    release() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (null === this.m_RedisClient) {
                return "[]";
            }
            return yield this.m_RedisClient.get(`user_{${key}}_roles`);
        });
    }
    setCache(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (null === this.m_RedisClient) {
                return false;
            }
            yield this.m_RedisClient.set(`user_{${key}}_roles`, JSON.stringify(value));
            return true;
        });
    }
}
exports.default = ACLRedisCache;
//# sourceMappingURL=ACLRedisCache.js.map