import { ITokenStorageProvider } from "../Storage/interfaces";
export declare class Token {
    uid: string;
    private tokenString;
    private storage;
    constructor(uid: string, tokenString: string, storage: ITokenStorageProvider);
    use(): Promise<string>;
}
