import {z} from "zod";
import {createTRPCRouter, publicProcedure, userProcedure } from "../trpc";

export const tankRouter = createTRPCRouter({
    getAllTanksGlobal: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.tank.findMany();
    }),
    getAllTanksByUser: publicProcedure.input(z.object({ userId: z.string() })).query(({ input, ctx }) => {
        return ctx.prisma.user.findUnique({ where: { id: input.userId } }).tanks();
    }
    ),
    getOneTank: publicProcedure.input(z.object({ id: z.string() })).query(({ input, ctx }) => {
        return ctx.prisma.tank.findUnique({ where: { id: input.id } });
    }
    ),
    createTank: userProcedure.input(z.object({ name: z.string(), type: z.string() })).query(({ input, ctx }) => {
        return ctx.prisma.tank.create({ data: { name: input.name, type: input.type , userId: ctx.session.user.id} });
    }
    ),
    updateTank: userProcedure.input(z.object({  id: z.string(),
        name: z.string(),
        type: z.string(),
        fish: z.array(
          z.object({
            id: z.string(), scientificName: z.string(), commonName: z.string(), description: z.string(), image: z.string() 
          })),
        userId: z.string() })).query(({ input, ctx }) => {
        return ctx.prisma.tank.update({ 
            where: { id: input.id }, 
            data: { 
                name: input.name, 
                type: input.type, 
                fish: { upsert: input.fish.map((f) => ({
                    where: { id: f.id },
                    update: {
                    scientificName: f.scientificName,
                    commonName: f.commonName,
                    description: f.description,
                    image: f.image,
                    },
                    create: {
                        id: f.id,
                        scientificName: f.scientificName,
                        commonName: f.commonName,
                        description: f.description,
                        image: f.image,
                    },
                    })),
                },
                userId: input.userId,
            },
        }); 
    }),
    deleteTank: userProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
        const tank = await ctx.prisma.tank.findUnique({ where: { id: input.id }, include: { user: true } });
        if (!tank) {
            throw new Error("Tank not found");
        }
        const deletedTank = await ctx.prisma.tank.delete({ where: { id: input.id } });
        await ctx.prisma.user.update({
            where: { id: tank?.user?.id },
            data: { tanks: { disconnect: { id: input.id } } },
        });
        return deletedTank;
    }),
});
