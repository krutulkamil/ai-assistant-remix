import { hash, compare } from "bcryptjs";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { prisma } from "~/data/database.server";
import { throwErrorResponse } from "~/services/throwErrorResponse";
import type { User as IUser } from "@prisma/client";
import type { SessionStorage } from "@remix-run/node";

const SESSION_SECRET: string = process.env.SESSION_SECRET!;

const sessionStorage: SessionStorage = createCookieSessionStorage({
    cookie: {
        secure: process.env.NODE_ENV === "production",
        secrets: [SESSION_SECRET],
        sameSite: "lax",
        maxAge: 0,
        httpOnly: true
    }
});

const createUserSession = async (userId: IUser["id"], remember: boolean, redirectPath: string): Promise<Response> => {
    const session = await sessionStorage.getSession();
    session.set("userId", userId);

    return redirect(redirectPath, {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session, {
                maxAge: remember
                    ? 60 * 60 * 24 * 7 // 7 days
                    : 60 * 60 * 24 // 1 day
            })
        }
    });
};

export const getUserInfoFromSession = async (request: Request): Promise<Omit<IUser, "password"> | null> => {
    const userId = await requireUserSession(request);

    if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (user) {
            const { password, ...userInfo } = user;
            return userInfo;

        } else {
            return null;
        }
    } else {
        return null;
    }
};

export const getUserFromSession = async (request: Request): Promise<string | null> => {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));

    const userId: string = session.get("userId");

    if (!userId) {
        return null;
    }

    return userId;
};

export const destroyUserSession = async (request: Request): Promise<Response> => {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));

    return redirect("/", {
        headers: {
            "Set-Cookie": await sessionStorage.destroySession(session)
        }
    });
};

export const requireUserSession = async (request: Request) => {
    const userId = await getUserFromSession(request);

    if (!userId) {
        throw redirect("/auth?mode=login");
    }

    return userId;
};

export const signup = async ({
                                 email,
                                 password,
                                 remember
                             }: { email: IUser["email"], password: IUser["password"], remember: boolean }): Promise<Response> => {
    const existingUser: IUser | null = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
        throwErrorResponse("A user with the provided email address exists already.", 422);
    }

    const passwordHash: string = await hash(password, 12);

    const user = await prisma.user.create({ data: { email, password: passwordHash } });
    return await createUserSession(user.id, remember, "/");
};

export const login = async ({
                                email,
                                password,
                                remember
                            }: { email: IUser["email"], password: IUser["password"], remember: boolean }): Promise<Response | undefined> => {
    const existingUser: IUser | null = await prisma.user.findFirst({ where: { email } });

    if (!existingUser) {
        throwErrorResponse("Could not log you in, please check the provided credentials.", 401);
    } else {
        const passwordCorrect: boolean = await compare(password, existingUser.password);

        if (!passwordCorrect) {
            throwErrorResponse("Could not log you in, please check the provided credentials.", 401);
        }

        return await createUserSession(existingUser.id, remember, "/");
    }
};

export const updateTokens = async (id: IUser["id"], newTokens: IUser["tokens"]) => {
    return prisma.user.update({
        where: { id },
        data: { tokens: newTokens }
    });
};