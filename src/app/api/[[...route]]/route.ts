import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'
interface Bindings {
    AI: Ai;
}
const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.get('/hello', async (c) => {

    const answer = await c.env.AI.run("@cf/meta/llama-3-8b-instruct", { 
        prompt: "hello",
    });
    console.log(answer);
  return c.json({
    message: answer,
  })
})

export const GET = handle(app)
export const POST = handle(app)