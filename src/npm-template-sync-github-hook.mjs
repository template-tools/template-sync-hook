import { Context, PreparedContext } from "npm-template-sync";
import { GithubProvider } from "github-repository-provider";
import {} from "systemd";
import createHandler from "github-webhook-handler";
import micro from "micro";

let notify;
let port = "systemd";

if (process.env.PORT !== undefined) {
  port = parseInt(process.env.PORT, 10);
  if (Number.isNaN(port)) {
    port = process.env.PORT;
  }
}

try {
  notify = require("sd-notify");
  notify.sendStatus("starting up");
} catch (e) {}

const context = new Context(
  new GithubProvider(GithubProvider.optionsFromEnvironment(process.env)),
  {
    logger: console
  }
);

const handler = createHandler({
  path: "/webhook",
  secret: process.env.WEBHOOK_SECRET
});

handler.on("error", err => {
  console.error("Error:", err.message);
});

handler.on("ping", async event => {
  console.log(
    "Received a ping event for %s",
    event.payload.repository.full_name
  );
});

handler.on("push", async event => {
  console.log(
    "Received a push event for %s to %s",
    event.payload.repository.full_name,
    event.payload.ref
  );

  try {
    const pullRequest = await PreparedContext.execute(
      context,
      event.payload.repository.full_name
    );

    console.log("Generated %s", pullRequest);
  } catch (e) {
    console.error(e);
  }
});

const server = micro(async (req, res) => {
  handler(req, res, err => {
    if (err) {
      console.log(err);
      res.writeHead(404);
      res.end("no such location");
    } else {
      res.writeHead(200);
      res.end("woot");
    }
  });
});

server.listen(port);

if (notify !== undefined) {
  notify.ready();
}
