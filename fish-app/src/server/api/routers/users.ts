import {z} from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
    getAll: adminProcedure.query(({ ctx }) => {
        return ctx.prisma.user.findMany();
    }
    ),
    getOne: adminProcedure.input(z.object({ id: z.string() })).query(({ input, ctx }) => {
        return ctx.prisma.user.findUnique({ where: { id: input.id } });
    }
    ),
    create: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.user.create({ data: { role: "USER" } });
    }
    ),
    update: adminProcedure
        .input(z.object({ id: z.string(), role: z.string() }))
        .query(({ input, ctx }) => {
            return ctx.prisma.user.update({ where: { id: input.id }, data: { role: input.role } });
        }
        ),
    delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(({ input, ctx }) => {
            return ctx.prisma.user.delete({ where: { id: input.id } });
        }
        ),
    promoteToAdmin: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(({ input, ctx }) => {
            return ctx.prisma.user.update({ where: { id: input.id }, data: { role: "ADMIN" } });
        }
        ),
    demoteToUser: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(({ input, ctx }) => {
            return ctx.prisma.user.update({ where: { id: input.id }, data: { role: "USER" } });
        }
        ),
});