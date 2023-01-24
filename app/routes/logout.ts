import { json } from "@remix-run/node";
import { destroyUserSession } from "~/data/auth.server";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        throw json({ message: "Invalid request method" }, { status: 400 });
    }

    return await destroyUserSession(request);
};