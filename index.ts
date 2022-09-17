import { serve } from "https://deno.land/std@0.154.0/http/server.ts";

async function gvm(req: Request): Promise<Response> {
  const parameters = new URL(req.url).searchParams;

  for (const [key, value] of parameters) {
    console.log(`${key}: ${value}`);
  }

  const assembly = parameters.get("assembly") || "";
  const input = parameters.get("input") || "";

  if (assembly === null) {
    return new Response("assembly key is not defined");
  }

  let cmd = [];
  if (parameters.get("win") === "true") {
    cmd = [
      "cmd",
      "/C",
      "echo",
      input,
      assembly,
    ];
  } else {
    cmd = ["./jpp_interpreter", input, assembly];
  }

  try {
    const p = Deno.run({ cmd, stdout: "piped" });

    // await its completion
    const [_, stdout] = await Promise.all([
      p.status(),
      p.output(),
    ]);
    const result = new TextDecoder().decode(stdout);
    return new Response(result);
  } catch (error) {
    return new Response(error);
  }
}

async function handler(req: Request): Promise<Response> {
  console.log("Method:", req.method);

  const url = new URL(req.url);

  if (url.pathname === "/gvm" && req.method == "GET") {
    return await gvm(req);
  }

  return new Response("Hello, World!");
}

serve(handler, { port: 6060 });
