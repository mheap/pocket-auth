const chai = require("chai");
const expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
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
    it("should make a request to the correct endpoint", function() {
      const mock = this.sandbox.mock(r2, "post");
      mock
        .expects("post")
        .once()
        .withArgs("https://getpocket.com/v3/oauth/request")
        .returns(makeSuccess({}));

      return pocketAuth
        .fetchToken("consumer-key", "http://localhost", {})
        .then(function() {
          mock.verify();
        });
    });

    it("should resolve a promise on success", function() {
      this.sandbox.stub(r2, "post").returns(makeSuccess({}));
      const p = pocketAuth.fetchToken("consumer-key", "http://localhost", {});
      expect(p).to.be.an.instanceof(Promise);
      expect(p).to.eventually.eql({});
    });

    it("should reject a promise on error", function() {
      this.sandbox.stub(r2, "post").returns(makeError("403 Forbidden"));

      expect(
        pocketAuth.fetchToken("consumer-key", "http://localhost", {})
      ).to.eventually.be.rejectedWith("403 Forbidden");
    });

    it("should should return a request token", function() {
      const returnBody = { request_token: "demo" };
      this.sandbox.stub(r2, "post").returns(makeSuccess(returnBody));

      expect(
        pocketAuth.fetchToken("consumer-key", "http://localhost", {})
      ).to.eventually.eql(returnBody);
    });

    it("should run callback on success", function(done) {
      this.sandbox.stub(r2, "post").returns(makeSuccess({}));
      pocketAuth.fetchToken("consumer-key", "http://localhost", {}, function(
        err,
        data
      ) {
        expect(data).to.eql({});
        done();
      });
    });

    it("should run callback on error", function(done) {
      this.sandbox.stub(r2, "post").returns({
        response: Promise.reject(
          new Error("request to http://example.com/missing.php failed")
        )
      });

      pocketAuth.fetchToken("consumer-key", "http://localhost", {}, function(
        err,
        data
      ) {
        expect(err.message).to.eql(
          "request to http://example.com/missing.php failed"
        );
        expect(data).to.be.undefined;
        done();
      });
    });
  });

  describe("#getRedirectUrl()", function() {
    it("should make a request to the correct endpoint", function() {
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
    it("should make a request to the correct endpoint", function() {
      const mock = this.sandbox.mock(r2, "post");
      mock
        .expects("post")
        .once()
        .withArgs("https://getpocket.com/v3/oauth/authorize")
        .returns(makeSuccess({}));

      pocketAuth
        .getAccessToken("consumer-key", "http://localhost")
        .then(function() {
          mock.verify();
        });
    });

    it("should resolve a promise on success", function() {
      this.sandbox.stub(r2, "post").returns(makeSuccess({}));
      const p = pocketAuth.getAccessToken("consumer-key", "request_token");
      expect(p).to.be.an.instanceof(Promise);
      expect(p).to.eventually.eql({});
    });

    it("should reject a promise on non-JSON responses", function() {
      this.sandbox.stub(r2, "post").returns(makeSuccess("403 Forbidden"));

      expect(
        pocketAuth.getAccessToken("consumer-key", "request_token")
      ).to.eventually.be.rejectedWith("403 Forbidden");
    });

    it("should reject a promise on error", function() {
      this.sandbox.stub(r2, "post").returns(makeError("403 Forbidden"));

      expect(
        pocketAuth.getAccessToken("consumer-key", "request_token")
      ).to.eventually.be.rejectedWith("403 Forbidden");
    });

    it("should return an access token", function() {
      const returnBody = { access_token: "my-token" };
      this.sandbox.stub(r2, "post").returns(makeSuccess(returnBody));
      expect(
        pocketAuth.getAccessToken("consumer-key", "request_token")
      ).to.eventually.eql(returnBody);
    });

    it("should run callback on success", function(done) {
      this.sandbox.stub(r2, "post").returns(makeSuccess({}));
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
      this.sandbox.stub(r2, "post").returns({
        response: Promise.reject(
          new Error("request to http://example.com/missing.php failed")
        )
      });
      pocketAuth.getAccessToken("consumer-key", "request_token", function(
        err,
        data
      ) {
        expect(err.message).to.eql(
          "request to http://example.com/missing.php failed"
        );
        expect(data).to.be.undefined;
        done();
      });
    });
  });
});

function makeSuccess(content) {
  return {
    response: Promise.resolve({
      text: function() {
        return Promise.resolve(JSON.stringify(content));
      }
    })
  };
}

function makeError(content) {
  return {
    response: Promise.reject(new Error(content))
  };
}
