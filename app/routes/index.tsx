import { Form, Link, useLoaderData } from "@remix-run/react";
import { getUserInfoFromSession } from "~/data/auth.server";
import type { FunctionComponent } from "react";
import type { LoaderFunction } from "@remix-run/node";
import type { User as IUser } from "@prisma/client";

const Index: FunctionComponent = (): JSX.Element => {
    const user: IUser = useLoaderData<typeof loader>();

    return (
        <div className="flex min-h-screen items-center justify-center">
            <header className="max-w-3xl">
                <h1 className="text-4xl font-bold text-slate-100">
                    Welcome to the AI Writing Assistant
                </h1>
                <div className="mx-auto mt-4 flex w-full items-center justify-between px-20 text-slate-200">
                    <p>Welcome {user?.email ?? ""}</p>
                    <div className="flex gap-5">
                        <Link
                            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
                            to="/writing"
                        >
                            Start Writing
                        </Link>
                        <Form action="/logout" method="post">
                            <button
                                type="submit"
                                className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
                            >
                                Logout
                            </button>
                        </Form>
                    </div>
                </div>
            </header>
        </div>
    );
};

export const loader: LoaderFunction = async ({ request }) => {
    return await getUserInfoFromSession(request);
};

export default Index;