import { ITokenStorageProvider } from "../Storage/interfaces";

export class Token {
  constructor(
    public uid: string,
    private tokenString: string,
    private storage: ITokenStorageProvider
  ) {}

  public async use(): Promise<string> {
    await this.storage.tokenCanBeUsed(this);
    this.storage.tokenBeingUsed(this);
    return this.tokenString;
  }
}
