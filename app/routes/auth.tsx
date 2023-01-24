import AuthForm from "~/components/auth/AuthForm";
import { validateCredentials } from "~/data/validation.server";
import { login, signup } from "~/data/auth.server";
import type { FunctionComponent } from "react";
import type { ActionFunction } from "@remix-run/node";
import type { User as IUser } from "@prisma/client";
import type { IUserValidationError } from "~/types/user";
import type { ResponseError } from "~/services/throwErrorResponse";

const AuthPage: FunctionComponent = (): JSX.Element => {
    return (
        <AuthForm />
    );
};

export const action: ActionFunction = async ({ request }) => {
    const searchParams: URLSearchParams = new URL(request.url).searchParams;
    const authMode: string = searchParams.get("mode") || "login";

    const formData: FormData = await request.formData();

    const credentials = Object.fromEntries(formData) as unknown as IUser;
    const remember = formData.get("remember") as unknown as boolean;

    try {
        validateCredentials(credentials);
    } catch (error) {
        return error as IUserValidationError;
    }

    try {
        if (authMode === "login") {
            return await login({ ...credentials, remember });
        } else {
            return await signup({ ...credentials, remember });
        }
    } catch (error) {
        return { credentials: (error as ResponseError).message };
    }
};

export default AuthPage;