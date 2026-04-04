import { prisma } from "@/lib/db/prisma";

type AppRole = "OWNER" | "EDITOR" | "VIEWER" | "MANAGER";

type CreateUserInput = {
    email: string;
    instituteId?: string;
    role?: AppRole;
    name?: string;
    emailVerified?: boolean;
    otpPending?: boolean;
    otpHash?: string | null;
    otpResendCount?: number;
    otpExpiresAt?: Date | null;
};

const toPrismaRole = (role?: AppRole): "OWNER" | "EDITOR" | "VIEWER" | undefined => {
    if (!role) return undefined;
    if (role === "MANAGER") return "EDITOR";
    return role;
};

export const userRepository = {
    findById: async (id: string) => prisma.user.findUnique({ where: { id } }),

    findByEmail: async (email: string) =>
        prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        }),

    create: async (input: CreateUserInput) =>
        prisma.user.create({
            data: {
                email: input.email.trim().toLowerCase(),
                instituteId: input.instituteId,
                role: toPrismaRole(input.role) ?? "OWNER",
                name: input.name,
                emailVerified: input.emailVerified ?? false,
                otpPending: input.otpPending ?? false,
                otpHash: input.otpHash,
                otpResendCount: input.otpResendCount,
                otpExpiresAt: input.otpExpiresAt,
            },
        }),

    updateByEmail: async (
        email: string,
        input: {
            instituteId?: string;
            role?: AppRole;
            name?: string | null;
            emailVerified?: boolean;
            otpPending?: boolean;
            otpHash?: string | null;
            otpResendCount?: number;
            otpExpiresAt?: Date | null;
        }
    ) => {
        const normalizedEmail = email.trim().toLowerCase();
        await prisma.user.updateMany({
            where: { email: normalizedEmail },
            data: {
                ...(input.instituteId !== undefined ? { instituteId: input.instituteId } : {}),
                ...(input.role !== undefined ? { role: toPrismaRole(input.role) } : {}),
                ...(input.name !== undefined ? { name: input.name } : {}),
                ...(input.emailVerified !== undefined ? { emailVerified: input.emailVerified } : {}),
                ...(input.otpPending !== undefined ? { otpPending: input.otpPending } : {}),
                ...(input.otpHash !== undefined ? { otpHash: input.otpHash } : {}),
                ...(input.otpResendCount !== undefined ? { otpResendCount: input.otpResendCount } : {}),
                ...(input.otpExpiresAt !== undefined ? { otpExpiresAt: input.otpExpiresAt } : {}),
            },
        });

        return prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });
    },

    listByInstitute: async (instituteId: string) =>
        prisma.user.findMany({
            where: { instituteId },
            orderBy: { createdAt: "desc" },
        }),

    countByInstitute: async (instituteId: string) =>
        prisma.user.count({
            where: { instituteId },
        }),

    updateByIdAndInstitute: async (
        id: string,
        instituteId: string,
        input: { role?: AppRole; name?: string | null }
    ) =>
        prisma.user.updateMany({
            where: { id, instituteId },
            data: {
                ...(input.role !== undefined ? { role: toPrismaRole(input.role) } : {}),
                ...(input.name !== undefined ? { name: input.name } : {}),
            },
        }),

    removeByIdAndInstitute: async (id: string, instituteId: string) =>
        prisma.user.deleteMany({
            where: { id, instituteId },
        }),
};
