
const globalForPrisma = globalThis as unknown as {
};

export const prisma =
  globalForPrisma.prisma ||
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
