import test from "ava";
import execa from "execa";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import got from "got";
import signer from "x-hub-signature/src/signer";

const here = dirname(fileURLToPath(import.meta.url));

test("request", async t => {
  const secret = "aSecret";
  const port = "3127";

  let hook = execa(
    join(here, "..", "bin", "npm-template-sync-github-hook"),
    [],
    {
      env: {
        WEBHOOK_SECRET: secret,
        PORT: port
      }
    }
  );

  const sign = signer({ algorithm: "sha1", secret });
  const signature = sign(new Buffer("random-signature-body"));

  const response = await got.post(`http://localhost:${port}/webhook`, {
    headers: {
      "x-hub-signature": signature,
      "x-github-event": "push",
      "x-github-delivery": "77"
    }
  });

  //console.log(response.body);

  hook = await hook;
  console.log("STDOUT", hook.stdout);
  console.log("STDERR", hook.stderr);

  t.is(response.statusCode, 200);
});
