import { ITokenStorageProvider } from "./interfaces";
import { Token } from "../Token";
import * as redis from "redis";
import { ITokenProviderQuotaConsumed } from "../TokenProvider/interfaces";
export declare class RedisStorageProvider implements ITokenStorageProvider {
    private client;
    private providerUID;
    private quotas;
    private tokens;
    constructor(config: redis.ClientOpts);
    configureStorage(providerUID: string, quotas: ITokenProviderQuotaConsumed[]): void;
    getToken(token: string): Token;
    tokenCanBeUsed(token: Token): Promise<void>;
    tokenBeingUsed(token: Token): void;
    private checkQuotas;
    private getKey;
    private getQuotas;
    private getQuota;
    private setQuota;
}
