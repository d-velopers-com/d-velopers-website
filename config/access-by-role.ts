// Staff can edit/delete any post
// Collaborators can only edit/delete their own posts
export const accessByRole = {
  // Staff roles (full access)
  staff: process.env.STAFF_ROLES?.split(",").map(r => r.trim()) || [],
  // Collaborator roles (own posts only)
  collaborators: process.env.COLLABORATOR_ROLES?.split(",").map(r => r.trim()) || [],
  // Combined for job management access (can create posts)
  jobs_management: [
    ...(process.env.STAFF_ROLES?.split(",").map(r => r.trim()) || []),
    ...(process.env.COLLABORATOR_ROLES?.split(",").map(r => r.trim()) || []),
  ],
};
