import * as assert from "assert";
import { toLoadEvent } from "../src/app/browser_options";

test("toLoadEvent", () => {
    assert.equal(toLoadEvent(""), "domcontentloaded");
    assert.equal(toLoadEvent("domcontentloaded"), "domcontentloaded");
    assert.equal(toLoadEvent("load"), "load");
    assert.equal(toLoadEvent("networkidle0"), "networkidle0");
    assert.equal(toLoadEvent("networkidle2"), "networkidle2");
    assert.equal(toLoadEvent("NetworkIdle2"), "networkidle2");
    assert.equal(toLoadEvent("invalid-option"), "domcontentloaded");
});
