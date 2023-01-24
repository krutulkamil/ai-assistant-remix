import type { User as IUser } from "@prisma/client";
import type { IUserValidationError } from "~/types/user";

const isValidEmail = (value: string): boolean => {
    let isRegexValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    return !!(value && isRegexValid);
};

const isValidPassword = (value: string): boolean => {
    if (value) {
        return value.trim().length > 7 && value.trim().length <= 30;
    }
    return false;
};

export const validateCredentials = (input: IUser): void => {
    let validationErrors: IUserValidationError = {};

    if (!isValidEmail(input.email)) {
        validationErrors.email = "Invalid email address.";
    }

    if (!isValidPassword(input.password)) {
        validationErrors.password = "Invalid password. Must be at least 8 characters long and less than 30.";
    }

    if (Object.keys(validationErrors).length > 0) {
        throw validationErrors;
    }
};