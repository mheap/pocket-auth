const expect = require("chai").expect;
const sinon = require("sinon");

const r2 = require("r2");
const pocketAuth = require("../src/index");

describe("pocket-auth", function() {
  beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  describe("#fetchToken()", function() {
    it("should make a request to the correct endpoint", async function() {
      const mock = this.sandbox.mock(r2, "post");
      mock
        .expects("post")
        .once()
        .withArgs("https://getpocket.com/v3/oauth/request")
        .resolves({ text: Promise.resolve("{}") });
      const token = await pocketAuth.fetchToken(
        "consumer-key",
        "http://localhost",
        {}
      );
      mock.verify();
    });

    it("should resolve a promise on success", async function() {
      this.sandbox.stub(r2, "post").resolves({ text: Promise.resolve("{}") });
      const p = pocketAuth.fetchToken("consumer-key", "http://localhost", {});
      expect(p).to.be.an.instanceof(Promise);
      expect(await p).to.eql({});
    });

    it("should reject a promise on error", async function() {
      this.sandbox
        .stub(r2, "post")
        .resolves({ text: Promise.resolve("403 Forbidden") });
      try {
        const p = await pocketAuth.fetchToken(
          "consumer-key",
          "http://localhost",
          {}
        );
        throw new Error("fetchToken did not the promise as expected");
      } catch (err) {
        expect(err.message).to.eql("403 Forbidden");
      }
    });

    it("should should return a request token", async function() {
      const returnBody = { request_token: "demo" };
      this.sandbox
        .stub(r2, "post")
        .resolves({ text: Promise.resolve(JSON.stringify(returnBody)) });

      const token = await pocketAuth.fetchToken(
        "consumer-key",
        "http://localhost",
        {}
      );
      expect(token).to.eql(returnBody);
    });

    it("should run callback on success", function(done) {
      this.sandbox.stub(r2, "post").resolves({ text: Promise.resolve("{}") });
      pocketAuth.fetchToken("consumer-key", "http://localhost", {}, function(
        err,
        data
      ) {
        expect(data).to.eql({});
        done();
      });
    });

    it("should run callback on error", function(done) {
      this.sandbox.stub(r2, "post").rejects(new Error("OH NOES"));
      pocketAuth.fetchToken("consumer-key", "http://localhost", {}, function(
        err,
        data
      ) {
        expect(err.message).to.eql("OH NOES");
        expect(data).to.be.undefined;
        done();
      });
    });
  });

  describe("#getRedirectUrl()", function() {
    it("should make a request to the correct endpoint", async function() {
      const url = pocketAuth.getRedirectUrl(
        "consumer-key",
        "https://example.com"
      );
      expect(url).to.eql(
        "https://getpocket.com/auth/authorize?request_token=consumer-key&redirect_uri=https://example.com"
      );
    });
  });

  describe("#getAccessToken()", function() {
    it("should make a request to the correct endpoint", async function() {
      const mock = this.sandbox.mock(r2, "post");
      mock
        .expects("post")
        .once()
        .withArgs("https://getpocket.com/v3/oauth/authorize")
        .resolves({ text: Promise.resolve("{}") });
      const token = await pocketAuth.getAccessToken(
        "consumer-key",
        "http://localhost"
      );
      mock.verify();
    });

    it("should resolve a promise on success", async function() {
      this.sandbox.stub(r2, "post").resolves({ text: Promise.resolve("{}") });
      const p = pocketAuth.getAccessToken("consumer-key", "request_token");
      expect(p).to.be.an.instanceof(Promise);
      expect(await p).to.eql({});
    });

    it("should reject a promise on error", async function() {
      this.sandbox
        .stub(r2, "post")
        .resolves({ text: Promise.resolve("403 Forbidden") });
      try {
        const p = await pocketAuth.getAccessToken(
          "consumer-key",
          "request_token"
        );
        throw new Error("getAccessToken did not the promise as expected");
      } catch (err) {
        expect(err.message).to.eql("403 Forbidden");
      }
    });

    it("should return an access token", async function() {
      const returnBody = { access_token: "my-token" };
      this.sandbox
        .stub(r2, "post")
        .resolves({ text: Promise.resolve(JSON.stringify(returnBody)) });
      const token = await pocketAuth.getAccessToken(
        "consumer-key",
        "request_token"
      );
      expect(token).to.eql(returnBody);
    });

    it("should run callback on success", function(done) {
      this.sandbox.stub(r2, "post").resolves({ text: Promise.resolve("{}") });
      pocketAuth.getAccessToken("consumer-key", "request_token", function(
        err,
        data
      ) {
        expect(err).to.be.null;
        expect(data).to.eql({});
        done();
      });
    });

    it("should run callback on error", function(done) {
      this.sandbox.stub(r2, "post").rejects(new Error("OH NOES"));
      pocketAuth.getAccessToken("consumer-key", "request_token", function(
        err,
        data
      ) {
        expect(err.message).to.eql("OH NOES");
        expect(data).to.be.undefined;
        done();
      });
    });
  });
});
