import { parallelLimit } from "async";
import { existsSync, writeFile } from "fs";
import { mkdir } from "mkdir-recursive";
import { dirname } from "path";
import { URL } from "url";
import { promisify } from "util";

const mkdirAsync = promisify(mkdir);

export function isProduction() {
    return process.env.NODE_ENV !== "test";
}

export async function ensureBaseDirectoryAsync(dirPath: string): Promise<string> {
    return await ensureDirectoryAsync(dirname(dirPath));
}

export async function ensureDirectoryAsync(dirPath: string): Promise<string> {
    if (!existsSync(dirPath)) {
        try {
            await mkdirAsync(dirPath);
        } catch (e) {
            if (!existsSync(dirPath)) {
                throw e;
            }
        }
    }
    return dirPath;
}

export function isSuccessfulHttpCode(httpCode: number): boolean {
    return httpCode >= 200 && httpCode < 300;
}

const NON_TERMINAL_CODES = [409, 429];
export function isTerminalHttpCode(httpCode: number): boolean {
    return isSuccessfulHttpCode(httpCode)
        || (httpCode >= 300 && httpCode < 500 && !NON_TERMINAL_CODES.includes(httpCode));
}

export const asyncWriteFile = promisify(writeFile);
export const asyncParallelLimit = promisify(parallelLimit);

export function weakRandomString(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function urlToFilename(url: string): string {
    const urlParts = new URL(url);
    const strippedUrl = urlParts.host + urlParts.pathname;
    return strippedUrl
        .replace(/[:\/\\]/g, "_")
        .replace(/\//g, "_")
        .replace(/[\!\@\#\$\%\^\&\*\(\)\=\+\{\}\[\]\|\\]/g, "")
        .replace(/^_/g, "")
        .replace(/_$/g, "")
        .substring(0, 42)
        .trim();
}
