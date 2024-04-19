import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";


const app = new Hono<{
  // it's just for ts, env variables for cloudflare workers are stored in wrangler.toml file
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();
app.route("api/v1/user", userRouter);
app.route("api/v1/blog", blogRouter)

app.get("/", (c) => {

  const DB_URL = c.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasourceUrl: DB_URL,
  }).$extends(withAccelerate());
  // const prisma = createPrismaClient(c.env.DATABASE_URL);
  return c.text("Bloggle Backend UP");
});
export default app;
