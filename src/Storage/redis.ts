import { ITokenStorageProvider } from "./interfaces";
import { Token } from "../Token";
import * as redis from "redis";
import { ITokenProviderQuotaConsumed } from "../TokenProvider/interfaces";
import { hash } from "../utilities";

export class RedisStorageProvider implements ITokenStorageProvider {
  private client: redis.RedisClient;

  private providerUID: string;
  private quotas: ITokenProviderQuotaConsumed[];

  private tokens: Token[] = [];

  constructor(config: redis.ClientOpts) {
    this.client = redis.createClient(config);
  }

  public configureStorage(
    providerUID: string,
    quotas: ITokenProviderQuotaConsumed[]
  ): void {
    this.providerUID = providerUID;
    this.quotas = quotas;
  }

  public getToken(token: string): Token {
    // Get the hash for the token
    const uid = hash(token);

    // Check if the token exists in memory
    const foundToken = this.tokens.find((t) => t.uid === uid);
    if (foundToken) {
      return foundToken;
    }

    // Create a new token
    const newToken = new Token(uid, token, this);
    this.tokens.push(newToken);

    this.quotas.forEach((q) => {
      console.log(this.getKey(newToken, q));
    });

    return newToken;
  }

  public async tokenCanBeUsed(token: Token): Promise<void> {
    await this.checkQuotas(token);
    return;
  }

  public tokenBeingUsed(token: Token): void {
    this.quotas.forEach((q) => {
      this.setQuota(token, q);
    });
  }

  // Private

  private checkQuotas(token: Token): Promise<boolean> {
    return new Promise((res, rej) => {
      const interval = setInterval(async () => {
        // Get the quotas from redis
        const quotas = await this.getQuotas(token);

        // Compare the values
        const flags: boolean[] = quotas.map((q, i) => {
          const compareQuota = this.quotas[i];
          if (q < compareQuota.numberOfRequests) {
            return true;
          }
          return false;
        });

        if (!flags.includes(false)) {
          clearInterval(interval);
          res();
        }
      }, Math.random() * 20);
    });
  }

  private getKey(token: Token, quota: ITokenProviderQuotaConsumed): string {
    return `${this.providerUID}:${token.uid}:${quota.uid}`;
  }

  private async getQuotas(token: Token): Promise<number[]> {
    const out: any[] = [];
    for (let i = 0; i < this.quotas.length; i++) {
      const quota = await this.getQuota(token, this.quotas[i]);
      out.push(quota);
    }
    return out;
  }

  private getQuota(
    token: Token,
    quota: ITokenProviderQuotaConsumed
  ): Promise<number> {
    return new Promise((res, rej) => {
      this.client.get(this.getKey(token, quota), (err, data) => {
        if (err) rej(err);
        if (data === null) {
          res(0);
        }
        res(parseInt(data));
      });
    });
  }

  private setQuota(token: Token, quota: ITokenProviderQuotaConsumed): void {
    this.client.incr(this.getKey(token, quota));
    setTimeout(() => {
      this.client.decr(this.getKey(token, quota));
    }, quota.duration);
  }
}
