import { db } from '@/lib/db';
import { organizationMembers, teamMembers, ORG_ROLE_HIERARCHY, TEAM_ROLE_HIERARCHY } from '@/lib/db/schema';
import type { OrgRole, TeamRole } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Get user's role in an organization
 */
export async function getOrgRole(userId: string, orgId: string): Promise<OrgRole | null> {
  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.orgId, orgId)
    ),
  });

  return membership?.role as OrgRole | null;
}

/**
 * Get user's role in a team
 */
export async function getTeamRole(userId: string, teamId: string): Promise<TeamRole | null> {
  const membership = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, userId),
      eq(teamMembers.teamId, teamId)
    ),
  });

  return membership?.role as TeamRole | null;
}

/**
 * Check if user has at least the required role in an organization
 * Role hierarchy: member < manager < admin < owner
 */
export async function hasOrgPermission(
  userId: string,
  orgId: string,
  requiredRole: OrgRole
): Promise<boolean> {
  const userRole = await getOrgRole(userId, orgId);

  if (!userRole) {
    return false;
  }

  const userRoleIndex = ORG_ROLE_HIERARCHY.indexOf(userRole);
  const requiredRoleIndex = ORG_ROLE_HIERARCHY.indexOf(requiredRole);

  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Check if user has at least the required role in a team
 * Role hierarchy: member < lead
 */
export async function hasTeamPermission(
  userId: string,
  teamId: string,
  requiredRole: TeamRole
): Promise<boolean> {
  const userRole = await getTeamRole(userId, teamId);

  if (!userRole) {
    return false;
  }

  const userRoleIndex = TEAM_ROLE_HIERARCHY.indexOf(userRole);
  const requiredRoleIndex = TEAM_ROLE_HIERARCHY.indexOf(requiredRole);

  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Check if user is a member of an organization (any role)
 */
export async function isOrgMember(userId: string, orgId: string): Promise<boolean> {
  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.orgId, orgId)
    ),
  });

  return !!membership;
}

/**
 * Check if user is a member of a team (any role)
 */
export async function isTeamMember(userId: string, teamId: string): Promise<boolean> {
  const membership = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, userId),
      eq(teamMembers.teamId, teamId)
    ),
  });

  return !!membership;
}

/**
 * Check if user is org admin or owner
 */
export async function isOrgAdmin(userId: string, orgId: string): Promise<boolean> {
  return hasOrgPermission(userId, orgId, 'admin');
}

/**
 * Check if user is org owner
 */
export async function isOrgOwner(userId: string, orgId: string): Promise<boolean> {
  return hasOrgPermission(userId, orgId, 'owner');
}
