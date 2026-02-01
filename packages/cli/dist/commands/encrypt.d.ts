export interface EncryptOptions {
    inputDir: string;
    outputDir: string;
    password: string;
    title: string;
}
export declare function encryptCommand(options: EncryptOptions): Promise<void>;
