import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { fishRouter } from "./routers/fish";
import { tankRouter } from "./routers/tanks";
import { userRouter } from "./routers/users";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  fish: fishRouter,
  tanks: tankRouter,
  users: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
