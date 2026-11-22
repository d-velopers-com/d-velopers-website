// Staff can edit/delete any post
// Collaborators can only edit/delete their own posts
function parseRoleIds(value?: string): string[] {
  return (value || "")
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
}

export const accessByRole = {
  // Staff roles (full access)
  staff: parseRoleIds(process.env.STAFF_ROLES),
  // Collaborator roles (own posts only)
  collaborators: parseRoleIds(process.env.COLLABORATOR_ROLES),
  // Project display limits by Discord subscription tier.
  projectTiers: {
    developer: parseRoleIds(process.env.PROJECT_DEVELOPER_ROLE_IDS),
    pro: parseRoleIds(process.env.PROJECT_PRO_ROLE_IDS),
    elite: parseRoleIds(process.env.PROJECT_ELITE_ROLE_IDS),
  },
  // Combined for job management access (can create posts)
  jobs_management: [
    ...parseRoleIds(process.env.STAFF_ROLES),
    ...parseRoleIds(process.env.COLLABORATOR_ROLES),
  ],
};
