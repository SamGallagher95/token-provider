import { ITokenProviderConfig } from "./interfaces";
import { Token } from "../Token";
export declare class TokenProvider {
    private config;
    private storage;
    constructor(config: ITokenProviderConfig);
    getToken(token: string): Token;
}
