import test from "ava";
import {} from "../src/npm-template-sync-github-hook";

import got from "got";
import signer from "x-hub-signature/src/signer";

//const { signer } = require("x-hub-signature");

test("request", async t => {
  const secret = "aSecret";
  const port = "3100";

  process.env.WEBHOOK_SECRET = secret;
  process.env.PORT = port;

  const sign = signer({ algorithm: "sha1", secret });
  const signature = sign(new Buffer("random-signature-body"));

  const response = await got.post(`http://localhost:${port}/webhook`, {
    headers: {
      "x-hub-signature": signature,
      "x-github-event": "push",
      "x-github-delivery": "77"
    }
  });

  console.log(response.body);

  t.is(response.statusCode, 200);
});
