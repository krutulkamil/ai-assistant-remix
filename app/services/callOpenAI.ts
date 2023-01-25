export const callOpenAI = async (prompt: string, maxTokens: number) => {
    const response = await fetch("https://api.openai.com/v1/engines/text-davinci-002/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_KEY}`
        },
        body: JSON.stringify({
            prompt,
            max_tokens: Number(maxTokens),
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

    return response.json();
};