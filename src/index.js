const r2 = require("r2");
const REQUEST_URL = "https://getpocket.com/v3/oauth/request";
const REDIRECT_URL =
  "https://getpocket.com/auth/authorize?request_token={code}&redirect_uri={redirect}";
const AUTH_URL = "https://getpocket.com/v3/oauth/authorize";

const fetchToken = function(consumerKey, redirectUri, state, callback) {
  return promiseOrCallback(async function() {
    return await makeRequest(REQUEST_URL, {
      consumer_key: consumerKey,
      redirect_uri: redirectUri,
      state: state
    });
  }, callback);
};

const getRedirectUrl = function(code, redirectUri) {
  return REDIRECT_URL.replace("{code}", code).replace(
    "{redirect}",
    redirectUri
  );
};

const getAccessToken = function(consumerKey, code, callback) {
  return promiseOrCallback(function() {
    return makeRequest(AUTH_URL, {
      consumer_key: consumerKey,
      code: code
    });
  }, callback);
};

const makeRequest = function(url, payload) {
  return new Promise(async (resolve, reject) => {
    try {
      const r = await r2.post(url, {
        json: payload,
        headers: { "X-Accept": "application/json" }
      });

      const text = await r.text;
      if (text[0] != "{") {
        return reject(new Error(text));
      }
      return resolve(JSON.parse(text));
    } catch (err) {
      return reject(err);
    }
  });
};

const promiseOrCallback = function(func, callback) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await func();
      if (typeof callback == "function") {
        return callback(null, data);
      }
      return resolve(data);
    } catch (err) {
      if (typeof callback == "function") {
        return callback(err, null);
      }
      return reject(err);
    }
  });
};

module.exports = {
  fetchToken: fetchToken,
  getRedirectUrl: getRedirectUrl,
  getAccessToken: getAccessToken
};
