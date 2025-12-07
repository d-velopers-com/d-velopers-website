export enum Availability {
    FREELANCE = "FREELANCE",
    PART_TIME = "PART_TIME",
    FULL_TIME = "FULL_TIME",
    CONSULTING = "CONSULTING",
    NOT_AVAILABLE = "NOT_AVAILABLE",
}

export const AVAILABILITY_LABELS: Record<Availability, string> = {
    [Availability.FREELANCE]: "Freelance",
    [Availability.PART_TIME]: "Part Time",
    [Availability.FULL_TIME]: "Full Time",
    [Availability.CONSULTING]: "Consulting",
    [Availability.NOT_AVAILABLE]: "Not Available",
};
