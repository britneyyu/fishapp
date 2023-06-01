import {z } from "zod";

import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const fishRouter = createTRPCRouter({
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.fish.findMany();
    }
    ),
    getOne: publicProcedure.input(z.object({ id: z.string() })).query(({ input, ctx }) => {
        return ctx.prisma.fish.findUnique({ where: { id: input.id } });
    }
    ),
    create: adminProcedure
        .input(z.object({ scientificName: z.string(), commonName: z.string(), description: z.string(), image: z.string() }))
        .query(({ input, ctx }) => {
            return ctx.prisma.fish.create({ data: input });
        }
        ),
    update: adminProcedure
        .input(z.object({ id: z.string(), scientificName: z.string(), commonName: z.string(), description: z.string(), image: z.string() })).query(({ input, ctx }) => {
            return ctx.prisma.fish.update({ where: { id: input.id }, data: input });
        }
        ),
    delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(({ input, ctx }) => {
            return ctx.prisma.fish.delete({ where: { id: input.id } });
        }
        ),
    getFishByTank: publicProcedure.input(z.object({ tankId: z.string() })).query(({ input, ctx }) => {
        return ctx.prisma.tank.findUnique({ where: { id: input.tankId } }).fish();
    }),
    //returns a map of fish scientific names and the number of fish of that type in the user's tanks, return type is Map<fishName: string, fishCount: number>
    getFishByUser: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ input, ctx }) => {
        const user = await ctx.prisma.user.findUnique({ where: { id: input.userId }, include: { tanks: { include: { fish: true } } } });
        const fishMap = new Map<string, number>();
        user?.tanks.forEach(tank => {
            tank.fish.forEach(fish => {
                const count = fishMap.get(fish.scientificName) || 0;
                fishMap.set(fish.scientificName, count + 1);
            });
        });
        return Object.fromEntries(fishMap); 
    }),
    });

