import * as z from "zod";

export const zRequiredString = (message: string) => z.string(message).min(1, message);

export const zRequiredNumber = (message: string) =>
    z.number(message).refine((val) => val !== 0, {
        message: message,
    });

export const zRequiredDate = (message: string) => z.iso.date(message);