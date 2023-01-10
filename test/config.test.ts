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
  assert.deepEqual(config.browser.height, 2160);
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
  assert.deepEqual(config.browser.width, 3840);
  assert.deepEqual(config.urls, ["http://www.cnn.com/"]);
  assert.deepEqual(config.servePath, "");
}
