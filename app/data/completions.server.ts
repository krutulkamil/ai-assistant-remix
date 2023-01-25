import { prisma } from "~/data/database.server";
import type { User as IUser } from "@prisma/client";

export const getMostRecentCompletions = async (userId: IUser["id"]) => {
    return prisma.completion.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5
    });
};

export const addCompletion = async ({
                           userId,
                           aiCompletion,
                           prompt,
                           tokens
                       }: {
    userId: IUser["id"],
    aiCompletion: string,
    prompt: string,
    tokens: number
}) => {
    return prisma.completion.create({
        data: {
            prompt,
            answer: aiCompletion,
            tokens: Number(tokens),
            user: {
                connect: { id: String(userId) }
            }
        }
    });
};