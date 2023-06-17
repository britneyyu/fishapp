/**
 * Router for handling fish-related API requests.
 */
export const fishRouter = createTRPCRouter({
    /**
     * Retrieves all fish from the database.
     * returns {Promise<Fish[]>} - An array of all fish in the database.
     */
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.fish.findMany();
    }),
    /**
     * Retrieves a single fish from the database by ID.
     * param {string} id - The ID of the fish to retrieve.
     * returns {Promise<Fish>} - The fish with the specified ID.
     */
    getOne: publicProcedure.input(z.object({ id: z.string() })).query(({ input, ctx }) => {
        return ctx.prisma.fish.findUnique({ where: { id: input.id } });
    }),
    /**
     * Creates a new fish in the database.
     * param {FishInput} input - The data for the new fish.
     * returns {Promise<Fish>} - The newly created fish.
     */
    create: adminProcedure
        .input(z.object({ scientificName: z.string(), commonName: z.string(), description: z.string(), image: z.string(), type: z.string()}))
        .query(({ input, ctx }) => {
            return ctx.prisma.fish.create({ data: input });
        }),
    /**
     * Updates an existing fish in the database.
     * @param {FishInput} input - The updated data for the fish.
     * @returns {Promise<Fish>} - The updated fish.
     */
    update: adminProcedure
        .input(z.object({ id: z.string(), scientificName: z.string(), commonName: z.string(), description: z.string(), image: z.string(), type: z.string()})).query(({ input, ctx }) => {
            return ctx.prisma.fish.update({ where: { id: input.id }, data: input });
        }),
    /**
     * Deletes a fish from the database by ID.
     * param {string} id - The ID of the fish to delete.
     * returns {Promise<Fish>} - The deleted fish.
     */
    delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(({ input, ctx }) => {
            return ctx.prisma.fish.delete({ where: { id: input.id } });
        }),
    /**
     * Retrieves all fish in a specific tank.
     * param {string} tankId - The ID of the tank to retrieve fish from.
     * returns {Promise<Fish[]>} - An array of all fish in the specified tank.
     */
    getFishByTank: publicProcedure.input(z.object({ tankId: z.string() })).query(({ input, ctx }) => {
        return ctx.prisma.tank.findUnique({ where: { id: input.tankId } }).fish();
    }),
    /**
     * Retrieves a map of all fish owned by a specific user and the number of each fish.
     * param {string} userId - The ID of the user to retrieve fish for.
     *  returns {Promise<Map<string, number>>} - A map of fish names to the number of each fish owned by the user.
     */
    getFishByUser: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ input, ctx }) => {
        const user = await ctx.prisma.user.findUnique({ where: { id: input.userId }, include: { tanks: { include: { fish: true } } } });
        const fishMap = new Map<string, number>();
        user?.tanks.forEach(tank => {
            tank.fish.forEach(fish => {
                const count = fishMap.get(fish.scientificName) || 0;
                fishMap.set(fish.scientificName, count + 1);
            });
        });
        return fishMap; 
    }),
});

