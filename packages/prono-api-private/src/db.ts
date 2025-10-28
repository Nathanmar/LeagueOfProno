import { PrismaClient as PC } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PC | undefined;
}

let prisma: InstanceType<typeof PC>;

if (process.env.NODE_ENV === "production") {
  prisma = new PC();
} else {
  if (!global.prismaInstance) {
    global.prismaInstance = new PC();
  }
  prisma = global.prismaInstance;
}

export { prisma as prismaDb };
