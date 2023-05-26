import { Client } from '@neondatabase/serverless';
import { Hono } from 'hono';

type Bindings = {
    DATABASE_URL: string
}

const app = new Hono<{ Bindings: Bindings }>();


app.get("/", async ({ env, executionCtx }) => {
    const client = new Client(env.DATABASE_URL);
    await client.connect();
    const { rows } = await client.query('SELECT * FROM articles');
    executionCtx.waitUntil(client.end());

    return new Response(JSON.stringify(rows));
})

app.get("/comments/:id", async ({ env, executionCtx, req }) => {
    const id = req.param('id')
    const client = new Client(env.DATABASE_URL);
    await client.connect();
    const { rows } = await client.query('SELECT * FROM comments WHERE article_id = $1', [id]);
    executionCtx.waitUntil(client.end());

    return new Response(JSON.stringify(rows));
})

app.post("/comment", async ({ req, env, executionCtx }) => {
    const body = await req.json();
    const client = new Client(env.DATABASE_URL);
    await client.connect();
    await client.query('INSERT INTO comments (comment,article_id) VALUES ($1,$2)', [body.comment, body.article_id]);
    executionCtx.waitUntil(client.end());

    return new Response(null);
})

export default app