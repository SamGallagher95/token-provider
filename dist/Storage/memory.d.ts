import { ITokenStorageProvider } from "./interfaces";
import { ITokenProviderQuotaConsumed } from "../TokenProvider/interfaces";
import { Token } from "../Token";
export declare class MemoryStorageProvider implements ITokenStorageProvider {
    private providerUID;
    private qutoas;
    private tokens;
    private quotaUsage;
    configureStorage(providerUID: string, quotas: ITokenProviderQuotaConsumed[]): void;
    getToken(token: string): Token;
    tokenCanBeUsed(token: Token): Promise<void>;
    tokenBeingUsed(token: Token): void;
    private checkQuotas;
}
