const r2 = require("r2");
const maybe = require("call-me-maybe");

const REQUEST_URL = "https://getpocket.com/v3/oauth/request";
const REDIRECT_URL =
  "https://getpocket.com/auth/authorize?request_token={code}&redirect_uri={redirect}";
const AUTH_URL = "https://getpocket.com/v3/oauth/authorize";

const fetchToken = function(consumerKey, redirectUri, state, callback) {
  return maybe(
    callback,
    makeRequest(REQUEST_URL, {
      consumer_key: consumerKey,
      redirect_uri: redirectUri,
      state: state
    })
  );
};

const getRedirectUrl = function(code, redirectUri) {
  return REDIRECT_URL.replace("{code}", code).replace(
    "{redirect}",
    redirectUri
  );
};

const getAccessToken = function(consumerKey, code, callback) {
  return maybe(
    callback,
    makeRequest(AUTH_URL, {
      consumer_key: consumerKey,
      code: code
    })
  );
};

const makeRequest = function(url, payload) {
  return new Promise(async (resolve, reject) => {
    r2
      .post(url, {
        json: payload,
        headers: { "X-Accept": "application/json" }
      })
      .then(function(r) {
        r.text.then(function(text) {
          if (text[0] != "{") {
            return reject(new Error(text));
          }
          return resolve(JSON.parse(text));
        });
      })
      .catch(function(err) {
        return reject(err);
      });
  });
};

module.exports = {
  fetchToken: fetchToken,
  getRedirectUrl: getRedirectUrl,
  getAccessToken: getAccessToken
};
