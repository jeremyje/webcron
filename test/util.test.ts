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
import { existsSync, rmdirSync } from "fs";
import * as util from "../src/app/util";

test("isProduction", () => {
    assert.equal(process.env.NODE_ENV, "test");
});

test("isProduction", () => {
    assert.equal(util.isProduction(), false);
});

test("isSuccessfulHttpCode", () => {
    assert.equal(util.isSuccessfulHttpCode(200), true);
    assert.equal(util.isSuccessfulHttpCode(201), true);
    assert.equal(util.isSuccessfulHttpCode(202), true);
    assert.equal(util.isSuccessfulHttpCode(203), true);
    assert.equal(util.isSuccessfulHttpCode(204), true);
    assert.equal(util.isSuccessfulHttpCode(205), true);
    assert.equal(util.isSuccessfulHttpCode(300), false);
    assert.equal(util.isSuccessfulHttpCode(404), false);
    assert.equal(util.isSuccessfulHttpCode(409), false);
    assert.equal(util.isSuccessfulHttpCode(429), false);
    assert.equal(util.isSuccessfulHttpCode(500), false);
});

test("isTerminalHttpCode", () => {
    assert.equal(util.isTerminalHttpCode(200), true);
    assert.equal(util.isTerminalHttpCode(201), true);
    assert.equal(util.isTerminalHttpCode(202), true);
    assert.equal(util.isTerminalHttpCode(203), true);
    assert.equal(util.isTerminalHttpCode(204), true);
    assert.equal(util.isTerminalHttpCode(205), true);
    assert.equal(util.isTerminalHttpCode(300), true);
    assert.equal(util.isTerminalHttpCode(404), true);
    assert.equal(util.isTerminalHttpCode(409), false);
    assert.equal(util.isTerminalHttpCode(429), false);
    assert.equal(util.isTerminalHttpCode(500), false);
});

test("weakRandomString", async () => {
    const str = util.weakRandomString();
    const strAgain = util.weakRandomString();
    assert.notEqual(str, "");
    assert.notEqual(strAgain, "");
    assert.notEqual(str, strAgain);
});

test("ensureBaseDirectoryAsync", async () => {
    const tmpDir = "tmp" + util.weakRandomString() + "1";
    try {
        const extraDir = tmpDir + "/extra/";
        const createdDir = await util.ensureBaseDirectoryAsync(extraDir);
        assert.equal(createdDir, tmpDir);
        assert.equal(existsSync(tmpDir), true);
    } finally {
        try {
            rmdirSync(tmpDir);
        } catch (e) {
            // nothing
        }
    }
});

test("ensureDirectoryAsync", async () => {
    const tmpDir = "tmp" + util.weakRandomString() + "2";
    try {
        const createdDir = await util.ensureDirectoryAsync(tmpDir);
        const createdAgainDir = await util.ensureDirectoryAsync(tmpDir);
        assert.equal(createdDir, tmpDir);
        assert.equal(createdDir, createdAgainDir);
        assert.equal(existsSync(tmpDir), true);
    } finally {
        try {
            rmdirSync(tmpDir);
        } catch (e) {
            // nothing
        }
    }
});

test("urlToFilename", async () => {
    assert.equal(util.urlToFilename("http://www.cnn.com/"), "www.cnn.com");
    assert.equal(
        util.urlToFilename("http://userver2:8080/server/appdata/swagger/"),
        "userver2_8080_server_appdata_swagger");
    assert.equal(
        util.urlToFilename("http://user:pass@userver2:8080/ok#$%^&*()@!_-+={}|[]\\:;\"'<>,.?/ok"),
        "userver2_8080_ok");
    assert.equal(
        util.urlToFilename("https://twitter.com/search?q=news&src=typd&lang=en"),
        "twitter.com_search");
    assert.equal(
        util.urlToFilename("https://www.youtube.com/feed/trending"),
        "www.youtube.com_feed_trending");
    assert.equal(
        util.urlToFilename("http://www.dailymail.co.uk/ushome/index.html"),
        "www.dailymail.co.uk_ushome_index.html");
    assert.equal(
        util.urlToFilename("http://justworldeducational.org/category/blog/"),
        "justworldeducational.org_category_blog");
    assert.equal(
        util.urlToFilename("https://en.wikinews.org/wiki/Main_Page"),
        "en.wikinews.org_wiki_Main_Page");
    assert.equal(util.urlToFilename(
        "https://en.wikinews.org/wiki/llllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll"),
        "en.wikinews.org_wiki_lllllllllllllllllllll");
});
