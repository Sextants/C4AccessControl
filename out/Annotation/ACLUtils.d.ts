import { ACResourceMatrix } from "../C4AccessControlTypes/C4AccessControlConfig";
import { C4AccessControl } from "..";
export declare function processStaticACL(aclOption: ACResourceMatrix, logger: any): ACResourceMatrix;
export declare function processACL(aclOption: ACResourceMatrix, path: string, method: string, logger: any): ACResourceMatrix | null;
export declare function checkACL(acl: C4AccessControl, aclConfig: ACResourceMatrix, method: string, userID: string, paramUser: string, logger: any): Promise<{
    role: string;
    pass: boolean;
    user?: string | undefined;
}>;
