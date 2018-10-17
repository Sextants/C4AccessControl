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
 * 测试用的Cache，在内存中存储
 */
class ACLDefaultCache extends C4AccessControlConfig_1.ACLCache {
    constructor() {
        super();
        this.m_ACLCached = {};
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.m_ACLCached = {};
            return true;
        });
    }
    release() {
        return __awaiter(this, void 0, void 0, function* () {
            this.m_ACLCached = {};
        });
    }
    getCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.m_ACLCached[key];
        });
    }
    setCache(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            this.m_ACLCached[key] = value;
            return true;
        });
    }
}
exports.default = ACLDefaultCache;
//# sourceMappingURL=ACLDefaultCache.js.map