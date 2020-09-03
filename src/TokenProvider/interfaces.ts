import { ITokenStorageProvider } from "../Storage/interfaces";

export interface ITokenProviderConfig {
  name: string;
  quotas: ITokenProviderQuota[];
  storage: ITokenStorageProvider;
}

export interface ITokenProviderQuota {
  numberOfRequests: number;
  duration: string; // parse-duration syntax
  parsedDuration?: number;
  uid?: string;
}

export interface ITokenProviderQuotaConsumed {
  uid: string;
  numberOfRequests: number;
  duration: number;
}

export interface ITokenProviderConfigConsumed {
  uid: string;
  quotas: ITokenProviderQuotaConsumed[];
  name?: string;
}
