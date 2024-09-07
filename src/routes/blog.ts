// import { TransactionIsolationLevel } from './../../node_modules/.prisma/client/index.d';
import { decode, sign, verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

import { Hono } from "hono";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  },
  Variables: {
    userId: string,
    Prisma: any,
  }
}>();

blogRouter.use("/*", async (c, next) => {
  const DB_URL = c.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasourceUrl: DB_URL,
  }).$extends(withAccelerate());

  c.set("Prisma", prisma)
  await next();
})


blogRouter.get("/bulk", async (c) => {
  // TODO: add pagination
  const body = c.req.json();
  const prisma = c.get("Prisma")
  const blogs = await prisma.post.findMany({
    select: {
      content: true,
      title: true,
      id: true,
      author: {
        select: {
          name: true,
        }
      }
    }
  });

  return c.json({
    blogs
  })
    ;

});


blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  console.log(id);
  //   const body = c.req.json();
  const prisma = c.get("Prisma")
  try {
    const blog = await prisma.post.findFirst({
      where: {
        id: Number(id),
      },
      select: {
        content: true,
        title: true,
        id: true,
        author: {
          select: {
            name: true,
          }
        }
      }
    });
    return c.json({
      blog,
    });
  } catch (error) {
    c.status(411);
    return c.json({
      message: "error while fetching data"
    })
  }
});
blogRouter.use("/*", async (c, next) => {
  var authHeader = c.req.header("authorization") || ""; //just to eliminate ts warnings, and set the type of authHeader as string.
  console.log(authHeader)
  authHeader = authHeader.split(" ")[1];
  console.log(authHeader)

  try {
    const user = await verify(authHeader, c.env.JWT_SECRET)
    if (user) {
      c.set("userId", user.id);
      await next();
    } else {
      c.status(403);
      return c.json({
        error: "true",
        message: "Bad auth"
      })
    }
  } catch (error) {
    console.log(error);
    c.status(200)
    return c.json({
      error: true,
      message: "Bad auth"
    })
  }
  // await next();
});
blogRouter.post("/create", async (c) => {
  const body = await c.req.json();
  const prisma = c.get("Prisma")

  const blog = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      "authorId": Number(c.get("userId")),
    },
  });

  return c.json({
    id: blog.id,
  });
});
blogRouter.put("/update", async (c) => {
  const body = await c.req.json();
  const prisma = c.get("Prisma")
  const blog = await prisma.post.update({
    where: {
      id: body.id
    },
    data: {
      title: body.title,
      content: body.content
    }

  })
  return c.text("Update blog route");
});
