import { Form, Link, useSearchParams, useNavigation, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Button, Input } from "@material-tailwind/react";
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
                        <div className="mt-1">
                            <Input
                                ref={emailRef}
                                label="Email address"
                                id="email"
                                required
                                autoFocus={true}
                                name="email"
                                type="email"
                                autoComplete="off"
                                aria-invalid={validationErrors?.email ? true : undefined}
                                aria-describedby="email-error"
                                className="w-full rounded border border-gray-500 px-2 !text-white"
                            />
                            {validationErrors?.email && (
                                <div className="pt-1 text-red-700" id="email-error">
                                    {validationErrors?.email}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="mt-1">
                            <Input
                                id="password"
                                ref={passwordRef}
                                label="Password"
                                name="password"
                                required
                                type="password"
                                aria-invalid={validationErrors?.password ? true : undefined}
                                autoComplete="off"
                                aria-describedby="password-error"
                                className="w-full rounded border border-gray-500 px-2 !text-white"
                                minLength={7}
                                maxLength={30}
                            />
                            {(validationErrors?.password || validationErrors?.credentials) && (
                                <div className="mt-4 text-red-700 text-sm" id="password-error">
                                    {validationErrors?.password || validationErrors?.credentials}
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full rounded py-3 px-4"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Authenticating..." : submitButtonCaption}
                    </Button>
                    <div className="flex flex-wrap items-center justify-between">
                        <div className="flex flex-wrap items-center">
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