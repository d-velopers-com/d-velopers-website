export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface User {
    id: string;
    discordId: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email: string | null;
    roles: string[];
}

export interface Session {
    user: User;
    expires: string;
}

export interface SessionState {
    status: SessionStatus;
    user: User | null;
}
