import { Form, Link, useSearchParams, useNavigation, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import type { FunctionComponent } from "react";
import type { Navigation } from "@remix-run/router";
import type { IUserValidationError } from "~/types/user";

const AuthForm: FunctionComponent = (): JSX.Element => {
    const [searchParams] = useSearchParams();
    const navigation: Navigation = useNavigation();
    const validationErrors: IUserValidationError | undefined = useActionData();

    const authMode = searchParams.get("mode") || "login";

    const submitButtonCaption = authMode === "login" ? "Login" : "Create User";
    const toggleButtonCaption = authMode === "login" ? "Create a new user" : "Log in with existing user";

    const isSubmitting = navigation.state !== "idle";

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (validationErrors?.email) {
            emailRef.current?.focus();
        }
        if (validationErrors?.password) {
            passwordRef.current?.focus();
        }
    }, [validationErrors])

    return (
        <div className="flex min-h-screen flex-col justify-center">
            <div className="mx-auto w-full max-w-lg px-8">
                <Form method="post" className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-slate-300"
                        >
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                ref={emailRef}
                                id="email"
                                required
                                autoFocus={true}
                                name="email"
                                type="email"
                                autoComplete="email"
                                aria-invalid={validationErrors?.email ? true : undefined}
                                aria-describedby="email-error"
                                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                            />
                            {validationErrors?.email && (
                                <div className="pt-1 text-red-700" id="email-error">
                                    {validationErrors?.email}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-300"
                        >
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                ref={passwordRef}
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                aria-invalid={validationErrors?.password ? true : undefined}
                                aria-describedby="password-error"
                                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                                minLength={7}
                                maxLength={30}
                            />
                            {(validationErrors?.password || validationErrors?.credentials) && (
                                <div className="pt-1 text-red-700" id="password-error">
                                    {validationErrors?.password || validationErrors?.credentials}
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Authenticating..." : submitButtonCaption}
                    </button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember"
                                name="remember"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                                htmlFor="remember"
                                className="ml-2 block text-sm text-gray-400"
                            >
                                Remember me
                            </label>
                        </div>
                        <div className="text-center text-sm text-gray-400">
                            Don't have an account?{" "}
                            <Link
                                className="text-blue-500 underline"
                                to={authMode === "login" ? "?mode=signup" : "?mode=login"}
                            >
                                {toggleButtonCaption}
                            </Link>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default AuthForm;