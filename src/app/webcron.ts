import { schedule, ScheduledTask } from "node-cron";
import { join } from "path";
import { WebBrowser } from "./browser";
import { IWebBrowserOptions } from "./browser_options";
import { IConfig } from "./config";
import { urlToFilename } from "./util";

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
            task.destroy();
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
        // tslint:disable-next-line:no-console
        console.log("Error: " + e);
    } finally {
        await wr.Close();
    }
    return config;
}
