import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/lib/session";
import {accessByRole} from "@/config/access-by-role";

export type Session = {
  discordId: string;
  roles?: string[];
  [key: string]: any;
};

export type AuthenticatedHandler<T = any> = (
  request: NextRequest,
  context: T,
  session: Session,
) => Promise<NextResponse>;

export function withAuth<T = any>(
  handler: AuthenticatedHandler<T>
) {
  return async (request: NextRequest, context: T) => {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    return handler(request, context, session as Session);
  };
}

export function withStaffRole<T = any>(handler: AuthenticatedHandler<T>) {
  return withAuth(async (request: NextRequest, context: T, session: Session) => {
    const staffRoles = accessByRole["jobs_management"];
    const hasStaffRole = session.roles?.some((role) => staffRoles.includes(role));
    if (!hasStaffRole) {
      return NextResponse.json({error: "Forbidden"}, {status: 403});
    }
    return handler(request, context, session);
  });
}
