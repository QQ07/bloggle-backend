import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { Hono } from "hono";
import { cors } from "hono/cors";


const app = new Hono<{
  // it's just for ts, env variables for cloudflare workers are stored in wrangler.toml file
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();
app.use("/*", cors())
app.route("/user", userRouter);
app.route("/blog", blogRouter)

app.get("/", (c) => {
  return c.text("Bloggle Backend UP");
});
export default app;
