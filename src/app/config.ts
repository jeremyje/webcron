import { readFile } from "fs";
import { load } from "js-yaml";
import { promisify } from "util";

const readFileAsync = promisify(readFile);
export async function readConfig(configFile: string): Promise<IConfig[]> {
    // tslint:disable-next-line:no-console
    console.log("Reading configuration: " + configFile);
    const configText = await readFileAsync(configFile, { encoding: "utf8" });
    return loadConfig(configText);
}

export function loadConfig(configText: string): IConfig[] {
    const config = load(configText) as IConfig[];
    const configs: IConfig[] = [];
    for (const c of config) {
        configs.push(fillConfig(c));
    }
    return configs;
}

export interface IConfigBrowser {
    attempts: number;
    flags: string[];
    headless: boolean;
    height: number;
    output: IOutputOptions;
    retryFactor: number;
    tabs: number;
    timeout: number;
    verbose: boolean;
    waitUntil: string;
    width: number;
}
export interface IConfig {
    name: string;
    outputDirectory: string;
    format: string[];
    immediateFirstRun: boolean;
    schedule: string;
    urls: string[];
    browser: IConfigBrowser;
    servePath: string;
}

export interface IOutputOptions {
    displayHeaderFooter: boolean;
    fullPage: boolean;
    landscape: boolean;
    pdfFormat: string;
    printBackground: boolean;
    quality: number;
    scale: number;
    textEncoding: string;
}

function fillConfig(options: IConfig): IConfig {
    options.name = getOrThrow(
        options.name || "",
        new Error("Configuration does not have a name."));
    const name = options.name;
    options.outputDirectory = getOrDefault(options.outputDirectory || "", "output/");
    options.format = getOrDefault(options.format || [], ["text"]);
    options.immediateFirstRun = getOrDefault(options.immediateFirstRun || undefined, true);
    options.schedule = getOrDefault(options.schedule || "", "*/5 * * * *");
    options.urls = getOrThrow(
        options.urls || [],
        new Error("Configuration [" + name + "] does not have any urls specified."));

    options.browser = getOrDefault(options.browser || undefined, getDefaultIConfigBrowser());
    options.servePath = getOrDefault(options.servePath || "", "");

    // .browser
    options.browser.attempts = getOrDefault(options.browser.attempts || undefined, getDefaultIConfigBrowser().attempts);
    options.browser.flags = getOrDefault(options.browser.flags || undefined, getDefaultIConfigBrowser().flags);
    options.browser.headless = getOrDefault(options.browser.headless || undefined, getDefaultIConfigBrowser().headless);
    options.browser.height = getOrDefault(options.browser.height || undefined, getDefaultIConfigBrowser().height);
    options.browser.output = getOrDefault(options.browser.output || undefined, getDefaultIConfigBrowser().output);
    options.browser.retryFactor =
        getOrDefault(options.browser.retryFactor || undefined, getDefaultIConfigBrowser().retryFactor);
    options.browser.tabs = getOrDefault(options.browser.tabs || undefined, getDefaultIConfigBrowser().tabs);
    options.browser.timeout = getOrDefault(options.browser.timeout || undefined, getDefaultIConfigBrowser().timeout);
    options.browser.verbose = getOrDefault(options.browser.verbose || undefined, getDefaultIConfigBrowser().verbose);
    options.browser.waitUntil =
        getOrDefault(options.browser.waitUntil || undefined, getDefaultIConfigBrowser().waitUntil);
    options.browser.width = getOrDefault(options.browser.width || undefined, getDefaultIConfigBrowser().width);

    // .browser.output
    options.browser.output.displayHeaderFooter = getOrDefault(
        options.browser.output.displayHeaderFooter || undefined,
        getDefaultIOutputOptions().displayHeaderFooter);
    options.browser.output.fullPage = getOrDefault(
        options.browser.output.fullPage || undefined,
        getDefaultIOutputOptions().fullPage);
    options.browser.output.landscape = getOrDefault(
        options.browser.output.landscape || undefined,
        getDefaultIOutputOptions().landscape);

    options.browser.output.pdfFormat = getOrDefault(
        options.browser.output.pdfFormat || undefined,
        getDefaultIOutputOptions().pdfFormat);

    options.browser.output.printBackground = getOrDefault(
        options.browser.output.printBackground || undefined,
        getDefaultIOutputOptions().printBackground);

    options.browser.output.quality = getOrDefault(
        options.browser.output.quality || undefined,
        getDefaultIOutputOptions().quality);

    options.browser.output.scale = getOrDefault(
        options.browser.output.scale || undefined,
        getDefaultIOutputOptions().scale);
    options.browser.output.textEncoding = getOrDefault(
        options.browser.output.textEncoding || undefined,
        getDefaultIOutputOptions().textEncoding);
    return options;
}

function getDefaultIConfigBrowser(): IConfigBrowser {
    return {
        attempts: 5,
        flags: [],
        headless: true,
        height: 1080,
        output: getDefaultIOutputOptions(),
        retryFactor: 1.3,
        tabs: 1,
        timeout: 60000,
        verbose: true,
        waitUntil: "domcontentloaded",
        width: 1920,
    };
}

function getDefaultIOutputOptions(): IOutputOptions {
    return {
        displayHeaderFooter: false,
        fullPage: true,
        landscape: false,
        pdfFormat: "A4",
        printBackground: false,
        quality: 100,
        scale: 1,
        textEncoding: "utf8",
    };
}

function getOrUndefined(val: any): any {
    if (val) {
        if (val.hasOwnProperty("length") && val.length === 0) {
            return undefined;
        }
        return val;
    }
    return undefined;
}

function getOrDefault(val: any, defaultVal: any): any {
    return getOrUndefined(val) || defaultVal;
}

function getOrThrow(val: any, error: Error): any {
    const getVal = getOrUndefined(val);
    if (getVal) {
        return getVal;
    }
    throw error;
}
