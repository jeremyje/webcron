// Copyright 2023 Jeremy Edwards
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
