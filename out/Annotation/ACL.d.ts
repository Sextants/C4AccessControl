import 'reflect-metadata';
import { ACLOptions, ACResourceMatrix } from '../C4AccessControlTypes/C4AccessControlConfig';
export declare function getACLMetaOption(target: any): ACLOptions;
export declare function getACLStaticMetaOption(target: any): ACLOptions;
export declare function ACL(config: ACResourceMatrix): (target: any, key: string, descriptor: PropertyDescriptor) => void;
