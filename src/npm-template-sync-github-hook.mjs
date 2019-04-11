import { Context, PreparedContext } from "npm-template-sync";
import { GithubProvider } from "github-repository-provider";
import createHandler from "github-webhook-handler";
import micro from "micro";


let port = 8088;

let sd = { notify: (...args) => console.log(...args), listener: () => [] };
try {
  sd = await import("sd-daemon");
  const listeners = sd.listeners();
  if (listeners.length > 0) port = listeners[0];

} catch (e) {}

sd.notify("READY=1\nSTATUS=starting");

if (process.env.PORT !== undefined) {
  port = parseInt(process.env.PORT, 10);
  if (Number.isNaN(port)) {
    port = process.env.PORT;
  }
}

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

const listener = server.listen(port, () => {
  console.log("listen on", listener.address());
  sd.notify("READY=1\nSTATUS=running");
});
