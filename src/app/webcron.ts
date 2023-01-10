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

import { schedule, ScheduledTask, validate } from "node-cron";
import { join } from "path";
import { WebBrowser } from "./browser";
import { IWebBrowserOptions } from "./browser_options";
import { IConfig } from "./config";
import { urlToFilename } from "./util";

export function validateConfig(configs: IConfig[]): Error {
    for (const config of configs) {
        if (!validate(config.schedule)) {
            return new Error(`Invalid cron schedule '${config.schedule}' in '${config.name}'.`);
        }
    }
    return undefined;
}

export function startWebcron(configs: IConfig[]): () => void {
    const taskCollection: ScheduledTask[] = [];
    for (const config of configs) {
        const task = schedule(config.schedule, () => downloadMain(config));
        taskCollection.push(task);
        if (config.immediateFirstRun) {
            downloadMain(config);
        }
    }
    return () => {
        for (const task of taskCollection) {
            task.stop();
        }
    };
}

async function downloadMain(config: IConfig) {
    const wr = new WebBrowser();
    try {
        await wr.Open(config.browser);
        const date = new Date();
        const now = date.getTime();
        const options = new Array<IWebBrowserOptions>();
        for (const url of config.urls) {
            const formatAndPaths = new Map<string, string>();
            for (const format of config.format) {
                formatAndPaths.set(format, join(config.outputDirectory, "" + now, urlToFilename(url) + "." + format));
            }
            options.push({
                formatAndPaths,
                targetUrl: url,
            });
        }
        await wr.renderBatchAsync({
            browser: config.browser,
            options,
        });
    } catch (e) {
        console.log("Error: " + e);
    } finally {
        await wr.Close();
    }
    return config;
}
