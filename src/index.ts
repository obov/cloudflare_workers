export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  DB: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

//@ts-ignore
import home from "./home.html";

function handleNotFound() {
  return new Response(null, {
    status: 404,
  });
}

function handleHome() {
  return new Response(home, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

function handleBadRequest() {
  return new Response(null, { status: 400 });
}

async function handleVisit(searchParams: URLSearchParams, env: Env) {
  console.log(searchParams.toString());
  const page = searchParams.get("page");
  if (!page) {
    return handleBadRequest();
  }
  const prevValue = await env.DB.get(page);
  let value = 1;
  if (prevValue) {
    value = parseInt(prevValue) + 1;
  }
  await env.DB.put(page, value + "");
  return new Response("visit");
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const { pathname, searchParams } = new URL(request.url);
    switch (pathname) {
      case "/":
        return handleHome();
      case "/visit":
        return handleVisit(searchParams, env);
      default:
        return handleNotFound();
    }
  },
};
