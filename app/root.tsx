import {
    Link,
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useCatch
} from "@remix-run/react";
import tailwindStyles from "./styles/app.css";
import globalStyles from "./styles/global.css";
import tooltipStyles from "react-tooltip/dist/react-tooltip.css";
import Error from "~/components/util/Error";
import type { FunctionComponent, ReactNode } from "react";
import type { ErrorBoundaryComponent, LinksFunction, MetaFunction } from "@remix-run/node";
import type { CatchBoundaryComponent } from "@remix-run/react/dist/routeModules";

interface DocumentProps {
    title?: string;
    children: ReactNode;
}

const Document: FunctionComponent<DocumentProps> = ({ title, children}): JSX.Element => {
    return (
        <html lang="en" className="h-full">
        <head>
            {title && <title>{title}</title>}
            <Meta />
            <Links />
        </head>
        <body className="min-h-screen bg-slate-900 px-4 sm:px-6">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        </body>
        </html>
    );
};

const App: FunctionComponent = (): JSX.Element => {
    return (
        <Document>
            <Outlet />
        </Document>
    );
};

export const CatchBoundary: CatchBoundaryComponent = (): JSX.Element => {
    const caughtResponse = useCatch();

    return (
        <Document title={caughtResponse.statusText}>
            <main>
                <Error title={caughtResponse.statusText}>
                    <p className="mt-2">{caughtResponse.data?.message || "Something went wrong. Please try again later."}</p>
                    <p className="mt-2">Back to <Link to="/" className="underline">safety</Link>.</p>
                </Error>
            </main>
        </Document>
    );
};

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }): JSX.Element => {
    return (
        <Document title="An error occurred.">
            <main>
                <Error title="An error occurred.">
                    <p className="mt-2">{error.message || "Something went wrong. Please try again later."}</p>
                    <p className="mt-2">Back to <Link to="/" className="underline">safety</Link>.</p>
                </Error>
            </main>
        </Document>
    );
};

export const meta: MetaFunction = () => ({
    charset: "utf-8",
    title: "New Remix App",
    viewport: "width=device-width,initial-scale=1"
});

export const links: LinksFunction = () => {
    return [
        { rel: "stylesheet", href: tailwindStyles },
        { rel: "stylesheet", href: globalStyles },
        { rel: "stylesheet", href: tooltipStyles }
    ];
}

export default App;
