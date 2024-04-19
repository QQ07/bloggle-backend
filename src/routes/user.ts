import { Hono } from 'hono';
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { signupInput } from '@qq07/bloggle-common';

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  Variables: {
    Prisma: any
  }
}>();

userRouter.use("/*", async (c, next) => {
  const DB_URL = c.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasourceUrl: DB_URL,
  }).$extends(withAccelerate());

  c.set("Prisma", prisma)
  await next();
})

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  
  const zodResponse = signupInput.safeParse(body)
  if (!zodResponse.success) {
    console.log(zodResponse.error)
    c.status(411)
    return c.json({
      message: "Invalid inputs",
     error: zodResponse.error
    })
  }
  const prisma = c.get("Prisma")

  // const DB_URL = c.env.DATABASE_URL;
  // const prisma = new PrismaClient({
  //   datasourceUrl: DB_URL,
  // }).$extends(withAccelerate());
  try {
    //todo: hash password
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });
    const jwt = await sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      c.env.JWT_SECRET
    );
    console.log(user + "created");
    return c.json({ user, jwt });
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.text("Some error");
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();
  console.log(body);

  const DB_URL = c.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasourceUrl: DB_URL,
  }).$extends(withAccelerate());

  try {
    //todo: hash password
    const user = await prisma.user.findFirst({
      where: {
        name: body.name,
        password: body.password,
      },
    });
    if (!user) {
      c.status(403); //unauthorizzed
      return c.json({ message: "Invalid username or password" });
    }
    const jwt = await sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      c.env.JWT_SECRET
    );
    return c.json({ user, jwt });
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.text("Some error");
  }
});
