import * as supertest from "supertest";
import { default as app } from "../src/server";

describe("GET /", () => {
  it("should return 200 OK", (done) => {
    supertest(app).get("/")
      .expect(200, done);
  });
});

describe("GET /config", () => {
  it("should return 200 OK", (done) => {
    supertest(app).get("/config")
      .expect(200, done);
  });
});
