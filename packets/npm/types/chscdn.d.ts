// TypeScript Version: 3.0
/// <reference types="node" />

declare module 'chscdn' {
    class CHSCDN {
        apilink: string;
        apikey: string;
        weblink: string;
        img_extensions: string[];
        vdo_extensions: string[];

        constructor();
        developermode(): void;
        APICaller(values: any): Promise<any>;
        image2base64(link: string): Promise<string>;
        video2base64(link: string): Promise<string>;
        compressBase64Image(base64Image: string, maxSizeKB?: number, minSkipSizeKB?: number): Promise<string>;
        chsAPI(uri: string, token: any): Promise<any>;
        dfd(values: any): Promise<any>;
        noise_detect(data: any): boolean;
        handle_error(code: any): void;
        error_detect(response: any, permite_to_speck?: string): boolean;
    }

    export = CHSCDN;
}
