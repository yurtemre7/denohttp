import { serve } from "https://deno.land/std@0.154.0/http/server.ts";

async function gvm(req: Request): Promise<Response> {
  const body = await req.arrayBuffer();
  const text = new TextDecoder("utf-8").decode(body);
  // convert text to JSON
  const json = JSON.parse(text);

  const assembly = json.assembly || "";
  const input = json.input || "";
  console.log("trying to run:");
  console.log(assembly);

  if (assembly === null) {
    return new Response("assembly key is not defined");
  }

  let cmd = [];
  let hasSucceed = false;
  cmd = ["./gvm", input, assembly];
  try {
    const p = Deno.run({ cmd, stdout: "piped" });

    // set timeout
    const timeout = 1000 * 5;

    setTimeout(() => {
      if (!hasSucceed) {
        p.kill("SIGTERM");
        console.log("timeout");
      }
    }, timeout);

    // await its completion
    const [_, stdout] = await Promise.all([
      p.status(),
      p.output(),
    ]);
    hasSucceed = stdout.length > 0;

    console.log("Code:");
    console.log(stdout);

    const result = new TextDecoder("utf-8").decode(stdout);

    console.log("has executed successfully?");
    console.log(hasSucceed);

    if (!hasSucceed) {
      return new Response(
        `Programm exceeded time limit of ${timeout / 1000} seconds`,
      );
    }

    console.log("Result:");
    console.log(result);

    return new Response(result);
  } catch (error) {
    return new Response(error);
  }
}

async function handler(req: Request): Promise<Response> {
  console.log("Method:", req.method);

  const url = new URL(req.url);

  if (url.pathname === "/gvm" && req.method == "POST") {
    return await gvm(req);
  }

  return new Response("Hello, World!");
}

// Tests
// testTextDecoder();
// testDenoRunWithDecoder();

serve(handler, { port: 6060 });
