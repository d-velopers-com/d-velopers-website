import { cache } from "react";

import { accessByRole } from "@/config/access-by-role";
import { getProjectAccess } from "@/lib/project-access";
import {
  normalizeCoverImageFit,
  normalizeCoverImagePosition,
  normalizeCoverImageZoom,
  type ProjectCoverFit,
} from "@/lib/project-cover";
import { resolveSession, type SessionData } from "@/lib/session";
import { getUserAccessStateByDiscordId, getUserByDiscordId } from "@/lib/user";
import { validateRecentActivation } from "@/lib/utils";

export interface SessionUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
  roles: string[];
}

export interface SessionState {
  user: SessionUser | null;
  discordReauthRequired: boolean;
}

export interface ProfileProject {
  id: string;
  title: string;
  description: string | null;
  url: string;
  coverImageUrl: string | null;
  coverImageFit: ProjectCoverFit;
  coverImagePositionX: number;
  coverImagePositionY: number;
  coverImageZoom: number;
  sortOrder: number;
}

export interface ViewerProfile {
  handler: string;
  isPublic: boolean;
  description: string | null;
  link: string | null;
  contactLinks: string[];
  contactEmail: string | null;
  country: string | null;
  name: string | null;
  title: string | null;
  tags: string[];
  englishLevel: string | null;
  availability: string[];
  yoe: number | null;
  projects: ProfileProject[];
  joinedServerAt: string | null;
  profileActivatedAt: string | null;
}

export interface ViewerPermissions {
  allowedRoles: string[];
  isServerMember: boolean;
  hasAllowedRole: boolean;
  hasCollaboratorRole: boolean;
  hasStaffRole: boolean;
  hasJobManagementRole: boolean;
  hasRecentActivation: boolean;
  canApplyTrialPeriod: boolean;
  canViewJobs: boolean;
  canMakePublic: boolean;
  projectLimit: number;
}

export interface ViewerContext {
  session: SessionState;
  profile: ViewerProfile | null;
  permissions: ViewerPermissions;
}

type PermissionProfileState = Pick<ViewerProfile, "profileActivatedAt">;

export function getAllowedRoles(): string[] {
  return (process.env.ALLOWED_ROLES || "")
    .split(",")
    .map((role) => role.trim())
    .filter((role) => role.length > 0);
}

function createSessionUser(session: SessionData): SessionUser {
  return {
    id: session.discordId,
    username: session.username,
    discriminator: session.discriminator,
    avatar: session.avatar,
    email: session.email,
    roles: session.roles,
  };
}

function serializeProfile(
  user: NonNullable<Awaited<ReturnType<typeof getUserByDiscordId>>>,
): ViewerProfile {
  return {
    handler: user.handler,
    isPublic: user.isPublic,
    description: user.description,
    link: user.link,
    contactLinks: Array.isArray(user.contactLinks) ? user.contactLinks : [],
    contactEmail: user.contactEmail,
    country: user.country,
    name: user.name,
    title: user.title,
    tags: Array.isArray(user.tags) ? user.tags : [],
    englishLevel: user.englishLevel,
    availability: Array.isArray(user.availability) ? user.availability : [],
    yoe: user.yoe,
    projects: Array.isArray(user.projects)
      ? user.projects.map((project) => {
          const coverImageFit = normalizeCoverImageFit(project.coverImageFit);

          return {
            id: project.id,
            title: project.title,
            description: project.description,
            url: project.url,
            coverImageUrl: project.coverImageUrl,
            coverImageFit,
            coverImagePositionX: normalizeCoverImagePosition(
              project.coverImagePositionX,
            ),
            coverImagePositionY: normalizeCoverImagePosition(
              project.coverImagePositionY,
            ),
            coverImageZoom: normalizeCoverImageZoom(
              project.coverImageZoom,
              coverImageFit,
            ),
            sortOrder: project.sortOrder,
          };
        })
      : [],
    joinedServerAt: user.joinedServerAt?.toISOString() ?? null,
    profileActivatedAt: user.profileActivatedAt?.toISOString() ?? null,
  };
}

function serializePermissionProfile(
  user: Awaited<ReturnType<typeof getUserAccessStateByDiscordId>>,
): PermissionProfileState | null {
  if (!user) {
    return null;
  }

  return {
    profileActivatedAt: user.profileActivatedAt?.toISOString() ?? null,
  };
}

function createPermissions(
  sessionUser: SessionUser | null,
  profile: PermissionProfileState | null,
  projectRoles?: readonly string[],
): ViewerPermissions {
  const allowedRoles = getAllowedRoles();
  const userRoles = sessionUser?.roles || [];
  const isServerMember = userRoles.length > 0;
  const hasAllowedRole = userRoles.some((role) => allowedRoles.includes(role));
  const hasCollaboratorRole = userRoles.some((role) =>
    accessByRole.collaborators.includes(role),
  );
  const hasStaffRole = userRoles.some((role) =>
    accessByRole.staff.includes(role),
  );
  const hasJobManagementRole = hasStaffRole || hasCollaboratorRole;
  const hasRecentActivation = validateRecentActivation(
    profile?.profileActivatedAt,
  );
  const canApplyTrialPeriod =
    isServerMember &&
    !hasAllowedRole &&
    allowedRoles.length > 0 &&
    !profile?.profileActivatedAt;
  const canViewJobs =
    !!sessionUser &&
    (hasAllowedRole ||
      hasStaffRole ||
      hasCollaboratorRole ||
      hasRecentActivation ||
      canApplyTrialPeriod);
  const canMakePublic =
    !!sessionUser &&
    (hasAllowedRole ||
      allowedRoles.length === 0 ||
      hasRecentActivation ||
      canApplyTrialPeriod);

  return {
    allowedRoles,
    isServerMember,
    hasAllowedRole,
    hasCollaboratorRole,
    hasStaffRole,
    hasJobManagementRole,
    hasRecentActivation,
    canApplyTrialPeriod,
    canViewJobs,
    canMakePublic,
    projectLimit: getProjectAccess(projectRoles ?? userRoles).limit,
  };
}

export const getSessionState = cache(async (): Promise<SessionState> => {
  const { session, discordReauthRequired } = await resolveSession();
  const sessionUser = session ? createSessionUser(session) : null;

  return {
    user: sessionUser,
    discordReauthRequired,
  };
});

export const getNavbarViewerContext = cache(async () => {
  const session = await getSessionState();
  const accessState = session.user
    ? await getUserAccessStateByDiscordId(session.user.id)
    : null;
  const permissions = createPermissions(
    session.user,
    serializePermissionProfile(accessState),
  );

  return {
    session,
    permissions,
  };
});

export const getViewerContext = cache(async (): Promise<ViewerContext> => {
  const session = await getSessionState();
  const user = session.user ? await getUserByDiscordId(session.user.id) : null;
  const profile = user ? serializeProfile(user) : null;
  const permissions = createPermissions(
    session.user,
    profile ? { profileActivatedAt: profile.profileActivatedAt } : null,
    user?.roles,
  );

  return {
    session,
    profile,
    permissions,
  };
});
