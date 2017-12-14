# pocket-auth

A small node.js library for authenticating with the [Pocket](https://getpocket.com) API.

[![Build Status](https://api.travis-ci.org/mheap/pocket-auth.svg?branch=master)](https://travis-ci.org/mheap/pocket-auth)

`pocket-auth` requires a minimum NodeJS version of 6.0

## The Pocket Auth Flow

Pocket use a modified `oauth` flow for gaining an access token that looks like the following:

* Fetch a `request_token` by making a `POST` request to https://getpocket.com/v3/oauth/request
* Open a browser to https://getpocket.com/auth/authorize?request_token={request_token}&redirect_uri={redirect_uri}, where `redirect_uri` the the URL to redirect to afterwards.
    * In a normal OAuth flow, the URL will contain an access token as a `GET` parameter at this point
    * In Pocket's flow, they redirect to `redirect_uri` exactly as it is provided. They do *not* add an access token (you request that separately later)
    * This means that you can use `https://google.com` as your redirect URL
* Once the user has clicked `Approve`, you can exchange your `request_token` for an access token by making a `POST` request to https://getpocket.com/v3/oauth/authorize

## Example Usage

You can use this library with either a Promise or a Callback based interface

### async/await

```javascript
async function main() {
    try {
        var auth = require("pocket-auth");

        var consumerKey = "your-consumer-key";
        var redirectUri = "https://google.com";

        let code = await auth.fetchToken(consumerKey, redirectUri, {});
        let uri = auth.getRedirectUrl(code.code, redirectUri);
        console.log("Visit the following URL and click approve in the next 10 seconds:");
        console.log(uri);

        setTimeout(async function(){
            try {
                let r = await auth.getAccessToken(consumerKey, code.code);
                console.log(r);
            } catch (err) {
                console.log("You didn't click the link and approve the application in time");
            }
        }, 10000);
    } catch (err) {
        console.log(err);
    }
}

main();
```

### Callback

```javascript
var auth = require("pocket-auth");

var consumerKey = "your-consumer-key";
var redirectUri = "https://google.com";

auth.fetchToken(consumerKey, redirectUri, {}, function(err, code) {
    let uri = auth.getRedirectUrl(code.code, redirectUri);
    console.log("Visit the following URL and click approve in the next 10 seconds:");
    console.log(uri);

    setTimeout(async function(){
        auth.getAccessToken(consumerKey, code.code, function(err, r) {
            if (err) {
                console.log("You didn't click the link and approve the application in time");
                return;
            }

            console.log(r);
        });
    }, 10000);
});

```
