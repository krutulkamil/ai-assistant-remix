import { Form, useLoaderData, useActionData, useTransition } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import { getUserInfoFromSession, requireUserSession, updateTokens } from "~/data/auth.server";
import { addCompletion, getMostRecentCompletions } from "~/data/completions.server";
import type { FunctionComponent, FormEvent, CSSProperties } from "react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import type { User as IUser, Completion as ICompletion } from "@prisma/client";

const WritingPage: FunctionComponent = (): JSX.Element => {
    const loaderData = useLoaderData<typeof loader>();
    const errors = useActionData<typeof action>();
    const transition = useTransition();
    const [textValue, setTextValue] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        if (textValue.length < 10 || transition.state === "submitting") {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, [textValue, transition.state]);

    const { user, recentCompletions } = loaderData;
    const tooltipMarkup: string = `The GPT family of models process text using <b>tokens</b>, which are common sequences of characters found in text.<br/> The models understand the statistical relationships between these tokens, and excel at producing the next token in a sequence of tokens.`;
    const spinnerOverride: CSSProperties = {
        display: "block",
        margin: "40px auto"
    };

    const onTextChangeHandler = (event: FormEvent<HTMLTextAreaElement>) => {
        setTextValue(event.currentTarget.value);
    };

    return (
        <div className="text-slate-100">
            <div className="mx-auto mt-4 flex w-full items-center justify-between text-slate-200">
                <p>Welcome {user.email}</p>
                <div className="flex gap-5">
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
            <h1 className="text-2xl font-bold ">AI Writing tool</h1>

            <Form method="post">
                <fieldset
                    disabled={transition.state === "submitting"}
                    className="mt-4 w-full"
                >

                    <textarea
                        name="prompt"
                        value={textValue}
                        id="prompt"
                        rows={5}
                        className="w-full rounded-sm bg-slate-800 p-4 text-slate-200 disabled:bg-slate-800 disabled:text-slate-400"
                        onChange={onTextChangeHandler}
                        placeholder="At least 10 characters required..."
                    >
                    </textarea>

                    {errors && <p className="text-sm text-red-700">{errors.tokens}</p>}
                    {errors && <p className="text-sm text-red-700">{errors.openAI}</p>}

                    <div className="mt-4 flex items-center">
                        <input
                            type="number"
                            name="tokens"
                            id="tokens"
                            defaultValue={150}
                            className="w-24 rounded-sm bg-slate-800 p-4 text-slate-200 disabled:bg-slate-900"
                        />

                        <Tooltip
                            anchorId="tokens"
                            place="bottom"
                            closeOnEsc
                            variant="info"
                            className="max-w-fit"
                            html={tooltipMarkup}
                        />

                        <button
                            disabled={isDisabled}
                            type="submit"
                            className="ml-4 rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600 disabled:bg-slate-800 disabled:hover:bg-slate-800"
                        >
                            Submit
                        </button>

                        <div className="ml-4">
                            You have {user.tokens.toLocaleString()} tokens remaining
                        </div>
                    </div>
                </fieldset>
            </Form>
            {transition.state && transition.state === "submitting" && (
                <ClimbingBoxLoader
                    color="rgb(59 130 246)"
                    loading={transition.state === "submitting"}
                    cssOverride={spinnerOverride}
                    size={30}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            )}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-indigo-500">
                    Recent Completions
                </h2>
                {recentCompletions &&
                    recentCompletions.map((completion: ICompletion) => {
                        let text: string | string[] = completion.answer;
                        if (text.includes("\n")) {
                            text = text.split("\n");
                        }
                        text = [...text];
                        return (
                            <div className="mt-8" key={completion.id}>
                                <h3 className="font-mono text-xl font-semibold text-white">
                                    {completion.prompt}
                                </h3>
                                <div>
                                    {text &&
                                        text.map((line: string) => (
                                            <p
                                                className="mt-2"
                                                key={`${line}-${Math.random()
                                                    .toString(36)
                                                    .slice(2, 7)}`}
                                            >
                                                {line}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserSession(request);
    const user = await getUserInfoFromSession(request);
    const recentCompletions = await getMostRecentCompletions(userId!);

    return { user, recentCompletions };
};

export const action: ActionFunction = async ({ request }) => {
    const userId: string = await requireUserSession(request);
    const user: Omit<IUser, "password"> | null = await getUserInfoFromSession(request);

    const formData: FormData = await request.formData();

    const body = Object.fromEntries(formData) as unknown as ICompletion;

    const errors: { tokens: string | undefined } = {
        tokens: user && Number(body.tokens) > user.tokens ? "Not enough tokens" : undefined
    };

    const hasErrors: boolean = Object.values(errors).some((errorMessage: string | undefined) => errorMessage);

    if (hasErrors) {
        return errors;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/engines/text-davinci-002/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_KEY}`
            },
            body: JSON.stringify({
                prompt: body.prompt,
                max_tokens: Number(body.tokens),
                temperature: 0.9,
                top_p: 1,
                frequency_penalty: 0.52,
                presence_penalty: 0.9,
                n: 1,
                best_of: 2,
                stream: false,
                logprobs: null
            })
        });

        const data = await response.json();
        const completionText = data.choices[0].text;

        const addedCompletion = await addCompletion({
            aiCompletion: completionText, userId, prompt: String(body.prompt), tokens: Number(body.tokens)
        });

        await updateTokens(userId, Number(user && user?.tokens - Number(body.tokens)));

        return { errors: undefined, addedCompletion };

    } catch (error) {
        const errors = {
            openAI: "Something went wrong. Try again in a sec."
        };

        return errors;
    }
};

export default WritingPage;