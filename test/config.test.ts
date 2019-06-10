import * as assert from "assert";
import { IConfig, loadConfig, readConfig } from "../src/app/config";

test("loadConfig No URLs", () => {
  assert.throws(() => {
    loadConfig(`---
    - name: "No URLs"`);
  }, "");
});

test("loadConfig Minimal", () => {
  assertOnlyConfigWithName(`---
  - name: "Minimal"
    urls:
      - http://www.cnn.com/`,
    "Minimal");
});

test("loadConfig Basic", () => {
  assertOnlyConfigWithName(`---
    - name: "Basic"
      browser:
        waitUntil: "domcontentloaded"
      output:
        fullPage: true
      urls:
        - http://www.cnn.com/`,
    "Basic");
});

test("readConfig examples/default-config.yaml", async () => {
  const configs = await readConfig("examples/default-config.yaml");
  assert.equal(configs.length, 1);
  const config0 = configs[0];
  assert.equal(config0.name, "Example");
  assertTemplateConfig(config0);
});

function assertOnlyConfigWithName(configTest: string, expectedName: string): void {
  const configs = loadConfig(configTest);
  assert.equal(configs.length, 1);
  const config0 = configs[0];
  assert.equal(config0.name, expectedName);
  assertTemplateConfig(config0);
}

function assertTemplateConfig(config: IConfig): void {
  assert.deepEqual(config.outputDirectory, "output/");
  assert.deepEqual(config.format, ["text"]);
  assert.deepEqual(config.immediateFirstRun, true);
  assert.deepEqual(config.schedule, "*/5 * * * *");
  assert.deepEqual(config.browser.attempts, 5);
  assert.deepEqual(config.browser.flags, []);
  assert.deepEqual(config.browser.headless, true);
  assert.deepEqual(config.browser.height, 1080);
  assert.deepEqual(config.browser.output.displayHeaderFooter, false);
  assert.deepEqual(config.browser.output.fullPage, true);
  assert.deepEqual(config.browser.output.landscape, false);
  assert.deepEqual(config.browser.output.pdfFormat, "A4");
  assert.deepEqual(config.browser.output.printBackground, false);
  assert.deepEqual(config.browser.output.quality, 100);
  assert.deepEqual(config.browser.output.scale, 1);
  assert.deepEqual(config.browser.output.textEncoding, "utf8");
  assert.deepEqual(config.browser.retryFactor, 1.3);
  assert.deepEqual(config.browser.tabs, 1);
  assert.deepEqual(config.browser.timeout, 60000);
  assert.deepEqual(config.browser.verbose, true);
  assert.deepEqual(config.browser.waitUntil, "domcontentloaded");
  assert.deepEqual(config.browser.width, 1920);
  assert.deepEqual(config.urls, ["http://www.cnn.com/"]);
  assert.deepEqual(config.servePath, "");
}
