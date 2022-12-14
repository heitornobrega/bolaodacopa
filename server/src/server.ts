import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import ShortUniqueId from "short-unique-id";
import { z } from "zod";

const prisma = new PrismaClient({
  log: ["query"],
});

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  fastify.get("/pools/count", async () => {
    const count = await prisma.pool.count();
    return { count };
  });

  fastify.post("/pools", async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    });
    const { title } = createPoolBody.parse(request.body);

    const generate = new ShortUniqueId({ length: 6 });
    const code = String(generate()).toLocaleUpperCase();
    await prisma.pool.create({
      data: {
        title,
        code,
      },
    });

    return reply.status(201).send({ title, code });
  });

  fastify.get("/users/count", async () => {
    const count = await prisma.user.count();
    return { count };
  });

  fastify.get("/guess/count", async () => {
    const count = await prisma.guess.count();
    return { count };
  });

  await fastify.listen({ port: 3333 });
}

bootstrap();
