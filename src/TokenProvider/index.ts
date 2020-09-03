import {
  ITokenProviderConfig,
  ITokenProviderConfigConsumed,
} from "./interfaces";
import parse from "parse-duration";
import { ITokenStorageProvider } from "../Storage/interfaces";
import { Token } from "../Token";
import { hash } from "../utilities";

export class TokenProvider {
  private config: ITokenProviderConfigConsumed;
  private storage: ITokenStorageProvider;

  constructor(config: ITokenProviderConfig) {
    // Create the config
    this.config = {
      uid: hash(config.name),
      name: config.name,
      quotas: config.quotas.map((q, i) => {
        return {
          uid: hash(`${config.name}-q-${i}`),
          numberOfRequests: q.numberOfRequests,
          duration: parse(q.duration),
        };
      }),
    };

    // Configure Storage
    this.storage = config.storage;
    this.storage.configureStorage(this.config.uid, this.config.quotas);
  }

  public getToken(token: string): Token {
    console.log("TokenProvider: GetToken");
    return this.storage.getToken(token);
  }
}
