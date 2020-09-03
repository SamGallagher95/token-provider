import { ITokenStorageProvider } from "./interfaces";
import { ITokenProviderQuotaConsumed } from "../TokenProvider/interfaces";
import { Token } from "../Token";
import { hash } from "../utilities";

export class MemoryStorageProvider implements ITokenStorageProvider {
  private providerUID: string;
  private qutoas: ITokenProviderQuotaConsumed[];

  private tokens: Token[] = [];
  private quotaUsage: IQuotaUsage[] = [];

  public configureStorage(
    providerUID: string,
    quotas: ITokenProviderQuotaConsumed[]
  ): void {
    this.providerUID = providerUID;
    this.qutoas = quotas;
  }

  public getToken(token: string): Token {
    // Return a token
    const uid = hash(token);

    // Attempt to find a token
    const foundToken = this.tokens.find((t) => t.uid === uid);
    if (foundToken) {
      return foundToken;
    }

    // Construct a new token
    const newToken = new Token(uid, token, this);
    this.tokens.push(newToken);

    // Construct a QuotaUsage item
    const quotaUsage: IQuotaUsage = {
      tokenUid: uid,
      quotas: this.qutoas.map((q) => {
        return {
          quotaUid: q.uid,
          usedRequests: 0,
        };
      }),
    };
    this.quotaUsage.push(quotaUsage);

    return newToken;
  }

  public tokenCanBeUsed(token: Token): Promise<void> {
    return new Promise((res, rej) => {
      const interval = setInterval(() => {
        if (this.checkQuotas(token)) {
          clearInterval(interval);
          res();
        }
      }, Math.random() * 20);
    });
  }

  public tokenBeingUsed(token: Token): void {
    const quotaUsage = this.quotaUsage.find((q) => q.tokenUid === token.uid);
    if (!quotaUsage) {
      throw new Error("Failed to find Quota Usage item");
    }

    this.qutoas.forEach((quota) => {
      const usage = quotaUsage.quotas.find((q) => q.quotaUid === quota.uid);
      if (!usage) {
        throw new Error("Failed to find usage item");
      }

      ++usage.usedRequests;
      setTimeout(() => {
        --usage.usedRequests;
      }, quota.duration);
    });
  }

  // Private

  private checkQuotas(token: Token): boolean {
    // Get the quota usage item
    const quotaUsage = this.quotaUsage.find((q) => q.tokenUid === token.uid);
    if (!quotaUsage) {
      throw new Error("Failed to find Quota Usage item");
    }

    const flags = quotaUsage.quotas.map((q: IUsage) => {
      const quota = this.qutoas.find((qu) => qu.uid === q.quotaUid);
      if (!quota) {
        throw new Error("Quota not found for usage");
      }

      if (q.usedRequests < quota.numberOfRequests) {
        return true;
      }
      return false;
    });

    if (!flags.includes(false)) {
      return true;
    }
    return false;
  }
}

interface IQuotaUsage {
  tokenUid: string;
  quotas: IUsage[];
}

interface IUsage {
  quotaUid: string;
  usedRequests: number;
}
