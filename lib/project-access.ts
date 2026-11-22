import { accessByRole } from "@/config/access-by-role";

export type ProjectTier = keyof typeof accessByRole.projectTiers;

export const PROJECT_LIMITS: Record<ProjectTier, number> = {
  developer: 2,
  pro: 5,
  elite: 10,
};

export interface ProjectAccess {
  tier: ProjectTier | null;
  limit: number;
}

export function getProjectAccess(roles: readonly string[] = []): ProjectAccess {
  const tierPriority: ProjectTier[] = ["elite", "pro", "developer"];

  for (const tier of tierPriority) {
    if (roles.some((role) => accessByRole.projectTiers[tier].includes(role))) {
      return { tier, limit: PROJECT_LIMITS[tier] };
    }
  }

  return { tier: null, limit: 0 };
}
