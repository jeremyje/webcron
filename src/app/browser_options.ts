import { LoadEvent } from "puppeteer";
import { IConfigBrowser } from "./config";

export interface IWebBrowserBatchOptions {
    options: IWebBrowserOptions[];
    browser: IConfigBrowser;
}
export interface IWebBrowserOptions {
    targetUrl: string;
    formatAndPaths: Map<string, string>;
}

export function toLoadEvent(name: string): LoadEvent {
    switch (name.toLowerCase()) {
        case "domcontentloaded":
            return "domcontentloaded";
        case "load":
            return "load";
        case "networkidle0":
            return "networkidle0";
        case "networkidle2":
            return "networkidle2";
        default:
            return "domcontentloaded";
    }
}
