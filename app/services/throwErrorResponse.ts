export interface ResponseError extends Error {
    status?: number;
}

export const throwErrorResponse = (message: string, status: number): void => {
    const error: ResponseError = new Error(message);
    error.status = status;
    throw error;
};