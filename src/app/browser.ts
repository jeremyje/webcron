import { parallelLimit } from "async";
import * as asyncRetry from "async-retry";
import { extname } from "path";
import { LabelValues } from "prom-client";
import * as puppeteer from "puppeteer";
import { IWebBrowserBatchOptions, IWebBrowserOptions, toLoadEvent } from "./browser_options";
import { IConfigBrowser, IOutputOptions } from "./config";
import metrics from "./metrics";
import {
    asyncWriteFile, ensureBaseDirectoryAsync,
    isSuccessfulHttpCode, isTerminalHttpCode,
} from "./util";

export class WebBrowser {
    private browser: puppeteer.Browser;
    public async Open(options: IConfigBrowser): Promise<void> {
        this.browser = await puppeteer.launch({
            args: ["--no-sandbox", "--mute-audio"].concat(options.flags),
            dumpio: options.verbose,
            headless: options.headless,
        });
    }
    public async Close(): Promise<void> {
        await this.browser.close();
    }
    public async renderBatchAsync(options: IWebBrowserBatchOptions) {
        const taskList = new Array<(callback: any) => void>();
        for (const option of options.options) {
            taskList.push(async (callback: any) => {
                try {
                    await this.renderAsyncSingle(option, options.browser);
                    // tslint:disable-next-line:no-console
                    console.log("Finished downloading: " + option.targetUrl);
                }
                catch (e) {
                    // tslint:disable-next-line:no-console
                    console.log("Error downloading: " + option.targetUrl + ". Error: " + e);
                }
                finally {
                    callback();
                }
            });
        }
        try {
            // TODO: This may or may not be blocking.
            await parallelLimit(taskList, options.browser.tabs);
        }
        catch (e) {
            // tslint:disable-next-line:no-console
            console.log("Error in parallelLimit(). Error: " + e);
        }
    }

    private async renderAsyncAttempt(
        targetUrl: string, option: IWebBrowserOptions, browserOptions: IConfigBrowser): Promise<number> {
        let status = 500;
        // tslint:disable-next-line:no-console
        console.log("renderAsyncAttempt(" + targetUrl + ")");
        const measureAttemptLatency = metrics.RenderAttemptLatency.startTimer();
        try {
            const page = await this.browser.newPage();
            try {
                await page.setViewport({ width: browserOptions.width, height: browserOptions.height });
                const response = await page.goto(targetUrl, {
                    timeout: browserOptions.timeout,
                    waitUntil: toLoadEvent(browserOptions.waitUntil),
                });
                status = response.status();
                if (isSuccessfulHttpCode(status)) {
                    for (const [format, filePath] of option.formatAndPaths) {
                        await ensureBaseDirectoryAsync(filePath);
                        await this.renderInternal(page, format, filePath, browserOptions.output);
                    }
                }
            }
            catch (e) {
                // tslint:disable-next-line:no-console
                console.log("Error while navigating to " + targetUrl + "\n" + e);
            }
            finally {
                await page.close();
            }
        } finally {
            measureAttemptLatency({ status });
            metrics.RenderRequestByStatusCount.inc({ status });
        }
        return status;
    }
    private async renderAsyncSingle(option: IWebBrowserOptions, browserOptions: IConfigBrowser): Promise<void> {
        const finishFuncs = new Array<(labels?: LabelValues<string>) => void>();
        metrics.RenderRequestCount.inc();
        let success = "false";
        const targetUrl = option.targetUrl;
        let status = 500;
        let attempt = 0;
        try {
            attempt++;
            for (const [format, filePath] of option.formatAndPaths) {
                const fileExtension = extname(filePath);
                finishFuncs.push(metrics.RenderLatency.startTimer({ format: fileExtension }));
            }
            status = await asyncRetry(async (bail: (e: Error) => void, currentAttempt: number) => {
                try {
                    status = await this.renderAsyncAttempt(targetUrl, option, browserOptions);
                } catch (e) {
                    bail(e);
                    status = 500;
                    // tslint:disable-next-line:no-console
                    console.log("Caught exception in renderAsyncSingle attempt " + currentAttempt + ": " + e);
                }
                if (!isTerminalHttpCode(status)) {
                    throw new Error("" + status);
                }
                return status;
            }, {
                factor: browserOptions.retryFactor,
                randomize: true,
                retries: browserOptions.attempts,
            });
            success = isSuccessfulHttpCode(status) ? "true" : "false";
        } finally {
            metrics.RenderRequestByAttemptCount.inc({ attempt });
            metrics.RenderRequestStatus.set({
                url: targetUrl,
            }, status);
            if (isSuccessfulHttpCode(status)) {
                metrics.RenderSuccessByAttemptCount.inc({ attempt });
            }
            for (const finishFunc of finishFuncs) {
                finishFunc({ success });
            }
        }
    }

    private async renderInternal(page: puppeteer.Page, format: string, filePath: string, options: IOutputOptions) {
        switch (format) {
            case "txt":
            case "text":
                const text = await page.evaluate(() => document.body.innerText);
                await asyncWriteFile(filePath, text, {
                    encoding: toBufferEncoding(options.textEncoding),
                    flag: "w",
                    mode: 0o660,
                });
                break;
            case "jpg":
            case "jpeg":
                await page.screenshot({
                    fullPage: options.fullPage,
                    path: filePath,
                    quality: options.quality,
                    type: "jpeg",
                });
                break;
            case "png":
                await page.screenshot({
                    fullPage: options.fullPage,
                    path: filePath,
                    type: "png",
                });
                break;
            case "pdf":
                await page.pdf({
                    displayHeaderFooter: options.displayHeaderFooter,
                    format: toPDFFormat(options.pdfFormat),
                    landscape: options.landscape,
                    path: filePath,
                    printBackground: options.printBackground,
                    scale: options.scale,
                });
                break;
            default:
                throw new Error("Format " + format + " is not supported.");
        }
    }
}

function toPDFFormat(format: string): puppeteer.PaperFormat {
    switch (format.toLowerCase()) {
        case "letter":
            return "letter";
        case "legal":
            return "legal";
        case "tabloid":
            return "tabloid";
        case "ledger":
            return "ledger";
        case "A0":
            return "a0";
        case "A1":
            return "a1";
        case "A2":
            return "a2";
        case "A3":
            return "a3";
        case "A4":
            return "a4";
        case "A5":
            return "a5";
        default: return "a4";
    }
}

function toBufferEncoding(format: string): BufferEncoding {
    switch (format.toLowerCase()) {
        case "ascii":
            return "ascii";
        case "utf8":
        case "utf-8":
            return "utf-8";
        case "utf16le":
            return "utf16le";
        case "ucs2":
        case "ucs-2":
            return "ucs2";
        case "base64":
            return "base64";
        case "base64url":
            return "base64url";
        case "latin1":
            return "latin1";
        case "binary":
            return "binary";
        case "hex":
            return "hex";
        default: return "utf8";
    }
}
