import { z } from "zod";
import { Availability } from "@/shared/constants";

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = z.object({
    name: z.string().max(100).optional().nullable(),
    title: z.string().max(200).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    country: z.string().length(2).optional().nullable(),
    englishLevel: z
        .enum(["A1", "A2", "B1", "B2", "C1", "C2", "NATIVE"])
        .optional()
        .nullable(),
    tags: z.array(z.string().max(50)).max(10).default([]),
    availability: z
        .array(z.nativeEnum(Availability))
        .default([]),
    yoe: z.number().int().min(0).max(50).optional().nullable(),
    contactEmail: z.string().email().optional().nullable(),
    contactLinks: z.array(z.string().url()).max(5).default([]),
    link: z.string().url().optional().nullable(),
    isPublic: z.boolean().optional(),
});

/**
 * Schema for search filters
 */
export const searchFiltersSchema = z.object({
    q: z.string().max(200).optional().default(""),
    english: z.string().optional(),
    availability: z.nativeEnum(Availability).optional().nullable(),
    country: z.string().length(2).optional(),
});

/**
 * Schema for handler param validation
 */
export const handlerSchema = z.object({
    handler: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[a-z0-9]+$/i, "Handler must be alphanumeric"),
});

// Type exports
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;
export type HandlerInput = z.infer<typeof handlerSchema>;
