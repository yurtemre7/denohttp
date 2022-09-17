import { serve } from "https://deno.land/std@0.154.0/http/server.ts";

async function gvm(req: Request): Promise<Response> {
  const body = await req.arrayBuffer();
  const text = new TextDecoder("utf-8").decode(body);
  console.log(text);

  const assembly = "";
  console.log("trying to run:");
  console.log(assembly);
  const input = "";

  if (assembly === null) {
    return new Response("assembly key is not defined");
  }

  let cmd = [];
  cmd = ["./jpp_interpreter", input, assembly];
  try {
    const p = Deno.run({ cmd, stdout: "piped" });

    // await its completion
    const [_, stdout] = await Promise.all([
      p.status(),
      p.output(),
    ]);
    const result = new TextDecoder("utf-8").decode(stdout);
    console.log("ran successfully");
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

function testTextDecoder() {
  let text = "plain text";
  let textWithNewLine = "plain\ntext";
  let uint8array = new Uint8Array([]);
  let uint8arrayWithNewLine = new Uint8Array([]);
  // constructor
  uint8array = new TextEncoder().encode(text);
  uint8arrayWithNewLine = new TextEncoder().encode(textWithNewLine);

  // decode
  text = new TextDecoder("utf-8").decode(uint8array);
  textWithNewLine = new TextDecoder("utf-8").decode(uint8arrayWithNewLine);

  console.log(text);
  console.log(textWithNewLine);
}

async function testDenoRunWithDecoder() {
  let cmd = [];
  cmd = ["cmd", "/c", "a.exe"];
  try {
    const p = Deno.run({ cmd, stdout: "piped" });

    // await its completion
    const [_, stdout] = await Promise.all([
      p.status(),
      p.output(),
    ]);
    const result = new TextDecoder("utf-8").decode(stdout);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}

// Tests
// testTextDecoder();
// testDenoRunWithDecoder();

serve(handler, { port: 6060 });
