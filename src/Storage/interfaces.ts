import { Token } from "../Token";
import { ITokenProviderQuotaConsumed } from "../TokenProvider/interfaces";

export interface ITokenStorageProvider {
  // Token Provider
  configureStorage: (
    providerUID: string,
    quotas: ITokenProviderQuotaConsumed[]
  ) => void;
  getToken: (token: string) => Token;

  // Token
  tokenCanBeUsed: (token: Token) => Promise<void>;
  tokenBeingUsed: (token: Token) => void;
}
