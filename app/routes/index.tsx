import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "@material-tailwind/react";
import { getUserInfoFromSession } from "~/data/auth.server";
import type { FunctionComponent } from "react";
import type { LoaderFunction } from "@remix-run/node";
import type { User as IUser } from "@prisma/client";

const Index: FunctionComponent = (): JSX.Element => {
    const user: IUser = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center text-white">
            <header className="max-w-3xl">
                <h1 className="text-4xl font-bold text-slate-100">
                    Welcome to the AI Writing Assistant
                </h1>
                <div className="mx-auto mt-4 flex w-full items-center justify-between px-10">
                    <p>Welcome {user?.email ?? ""}</p>
                    <div className="flex gap-5">
                        <Button
                            className="rounded py-2 px-4"
                            onClick={() => navigate("/writing")}
                        >
                            Start Writing
                        </Button>
                        <Form action="/logout" method="post">
                            <Button
                                type="submit"
                                className="rounded py-2 px-4"
                                variant="outlined"
                            >
                                Logout
                            </Button>
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