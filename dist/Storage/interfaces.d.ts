import { Token } from "../Token";
import { ITokenProviderQuotaConsumed } from "../TokenProvider/interfaces";
export interface ITokenStorageProvider {
    configureStorage: (providerUID: string, quotas: ITokenProviderQuotaConsumed[]) => void;
    getToken: (token: string) => Token;
    tokenCanBeUsed: (token: Token) => Promise<void>;
    tokenBeingUsed: (token: Token) => void;
}
