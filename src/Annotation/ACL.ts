import 'reflect-metadata'
import { ACLOptions, ACResourceMatrix } from '../C4AccessControlTypes/C4AccessControlConfig';
import { TypeUtils } from 'c4utils';

const ACL_OPTIONS_KEY           = "c4accesscontrol:access_ctrl_options";
const ACL_STATIC_OPTIONS_KEY    = "c4accesscontrol:access_ctrl_static_options";

export function getACLMetaOption(target : any) {
    let CurOpt = <ACLOptions>Reflect.getMetadata(ACL_OPTIONS_KEY, target);
    if (TypeUtils.isEmptyObj(CurOpt)) {
        CurOpt = {};
        Reflect.defineMetadata(ACL_OPTIONS_KEY, CurOpt, target);
    }
    return CurOpt;
}

export function getACLStaticMetaOption(target : any) {
    let CurOpt = <ACLOptions>Reflect.getMetadata(ACL_STATIC_OPTIONS_KEY, target);
    if (TypeUtils.isEmptyObj(CurOpt)) {
        CurOpt = {};
        Reflect.defineMetadata(ACL_STATIC_OPTIONS_KEY, CurOpt, target);
    }
    return CurOpt;
}

export function ACL(config : ACResourceMatrix) {
    return function (target : any, key : string, descriptor : PropertyDescriptor) {
        let CurOpt      = config;
        CurOpt.resource = config.resource   ? <string>(config.resource) : "";
        CurOpt.desc     = config.desc       ? <string>(config.desc)     : "";
        CurOpt.group    = config.group      ? <string>(config.group)    : "";
        if (TypeUtils.isUndefined(config.staticRes)) {
            CurOpt.staticRes = false;
        } else {
            CurOpt.staticRes    = config.staticRes;
        }
        let CurACLOpt : ACLOptions;
        if (CurOpt.staticRes === false)
            CurACLOpt = getACLMetaOption(target);
        else
            CurACLOpt = getACLStaticMetaOption(target);

        CurACLOpt[key]  = CurOpt;
    }
}
