import { Context, PreparedContext } from "npm-template-sync";
import { GithubProvider } from "github-repository-provider";
const micro = require("micro");
const createHandler = require("github-webhook-handler");

let notify;
let port = 3100;

try {
  /*
  require("systemd");
  port = "systemd";
  */
  notify = require("sd-notify");
  notify.sendStatus("starting up");
} catch (e) {}

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

  const context = new Context(
    new GithubProvider(GithubProvider.optionsFromEnvironment(process.env)),
    {
      logger: console
    }
  );

  try {
    const pullRequest = await PreparedContext.execute(
      context,
      event.payload.repository.full_name
    );

    console.log("Generated PullRequest %s", pullRequest);
  } catch (e) {
    console.error(e);
  }
});

const server = micro(async (req, res) => {
  handler(req, res, err => {
    if (err) {
      res.writeHead(404);
      res.end("no such location");
    }
  });

  res.writeHead(200);
  res.end("woot");
});

server.listen(port, () => {
  console.log(`listening...`, server._connectionKey);

  if (notify !== undefined) {
    notify.ready();
  }
});
