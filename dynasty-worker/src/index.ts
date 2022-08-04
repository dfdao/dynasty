/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Router } from 'itty-router';
import { getDefaultResponseHeaders, handleAddAdmin, handleAddRound, handleDeleteRound, handleEditRound, handleGetAdmins, handleGetRounds, handleRevokeAdmin, handleSelectRound, ScoringInterface, SignedScoringInterface } from './handler';


export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	DYNASTY_ADMIN: KVNamespace,
	DYNASTY_ROUNDS: KVNamespace
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
    const router = Router();
    ////////////////////////////
    // ROUNDS
    ////////////////////////////

    router.post("/rounds", async (request: Request, env: Env): Promise<Response> => {
      return handleAddRound(request, env);
    });

    router.get('/rounds', (_: Request, env: Env): Promise<Response> => {
      return handleGetRounds(env);
    })

    // router.options("/rounds", (r: Request) => {
    // 	console.log("LASJD:LAJSDLKJSLKSLD")
    // 		return new Response('', { status: 200, headers: getDefaultResponseHeaders() });
    // })

    router.get("/round/:id", ({params}: {params: {id: string}}, env: Env): Promise<Response> => {
      return handleSelectRound(params, env);
    });

    router.delete("/round/:id", ({params}: {params: {id: string}}, env: Env): Promise<Response> => {
      return handleDeleteRound(request, params, env);
    })

   router.put("/round/:id", ({params}: {params: {id: string}}, env: Env): Promise<Response> => {
      return handleEditRound(request, params, env);
    })


    ////////////////////////////
    // ADMINS
    ////////////////////////////

    router.get("/admins", (_: Request, env: Env): Promise<Response> => {
      return handleGetAdmins(env);
    })

    router.post("/admins/", (request: Request, env: Env): Promise<Response> => {
      return handleAddAdmin(request, env);
    })

    router.delete("/admins/:address", (request: Request, params: {address: string}, env: Env): Promise<Response> => {
      return handleRevokeAdmin(request, params, env);
    })

    // router.options("/admins/:address", handleOptions)

		if (request.method === 'OPTIONS') {
			return handleOptions(request);
    }
		  return router.handle(request, env)	
	},
};


function handleOptions(request: Request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers;
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    console.log("cors preflight")
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...getDefaultResponseHeaders(),
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      // 'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
    };

    return new Response(null, {
      status: 204,
      headers: respHeaders,
    });
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    console.log("standard options")
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS, DELETE, PATCH',
      },
    });
  }
}
