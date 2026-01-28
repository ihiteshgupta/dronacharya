# Phase 5: Enterprise - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Organizations can manage teams and track learning with role-based access control.

**Architecture:** Organization/team membership tables track roles. tRPC routers handle all enterprise operations. Middleware enforces access control.

**Tech Stack:** Next.js App Router, tRPC, Drizzle ORM, NextAuth.js

---

## Current State Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| Organization Schema | ✅ Complete | organizations, teams tables exist |
| User-Org Relations | ✅ Complete | users.orgId, users.teamId exist |
| Membership Tables | ❌ Missing | Need org/team members with roles |
| Organization Router | ❌ Missing | Need CRUD operations |
| Team Router | ❌ Missing | Need CRUD operations |
| Org Role Middleware | ❌ Missing | Need org-level access control |
| Enterprise UI | ❌ Missing | Need org/team pages |

---

## Task 1: Add Organization Membership Schema

**Files:**
- Modify: `src/lib/db/schema/organizations.ts`
- Modify: `src/lib/db/schema/index.ts`

**Description:**
Add organization members and team members junction tables with role columns to support organization-level RBAC.

**Schema Additions:**
```typescript
// Organization members (many-to-many with roles)
organizationMembers {
  id: uuid
  orgId: uuid -> organizations
  userId: uuid -> users
  role: varchar ('owner' | 'admin' | 'manager' | 'member')
  joinedAt: timestamp
}

// Team members (many-to-many with roles)
teamMembers {
  id: uuid
  teamId: uuid -> teams
  userId: uuid -> users
  role: varchar ('lead' | 'member')
  joinedAt: timestamp
}
```

**Commit message:** `feat: add organization and team membership schema`

---

## Task 2: Create Organization tRPC Router

**Files:**
- Create: `src/lib/trpc/routers/organization.ts`
- Modify: `src/lib/trpc/root.ts`

**Description:**
Create organization router with CRUD operations and member management.

**Key Procedures:**
```typescript
// Organization CRUD
organization.create({ name, slug })
organization.get({ orgId })
organization.update({ orgId, name, settings, branding })
organization.getStats({ orgId })

// Member management
organization.listMembers({ orgId })
organization.addMember({ orgId, email, role })
organization.updateMemberRole({ orgId, userId, role })
organization.removeMember({ orgId, userId })

// Team management within org
organization.listTeams({ orgId })
organization.createTeam({ orgId, name, description, managerId })
organization.updateTeam({ orgId, teamId, name, description })
organization.deleteTeam({ orgId, teamId })
```

**Role Requirements:**
- owner: full access
- admin: all except delete org, transfer ownership
- manager: view all, manage teams they lead
- member: view own progress only

**Commit message:** `feat: add organization tRPC router with member management`

---

## Task 3: Create Organization Role Middleware

**Files:**
- Modify: `src/lib/trpc/trpc.ts`
- Create: `src/lib/auth/org-permissions.ts`

**Description:**
Add organization-level role checking middleware for tRPC procedures.

**New Middleware:**
```typescript
// Requires user to be member of the specified org
orgMemberProcedure

// Requires user to be admin or owner of the org
orgAdminProcedure

// Requires user to be owner of the org
orgOwnerProcedure
```

**Permission Helper:**
```typescript
// Check if user has required role in org
hasOrgPermission(userId, orgId, requiredRole): boolean

// Get user's role in org
getOrgRole(userId, orgId): OrgRole | null
```

**Commit message:** `feat: add organization role middleware and permission helpers`

---

## Task 4: Create Organization Settings Page

**Files:**
- Create: `src/app/org/layout.tsx`
- Create: `src/app/org/page.tsx` (dashboard)
- Create: `src/app/org/settings/page.tsx`

**Description:**
Create organization pages with settings management.

**Dashboard Features:**
- Organization stats (members, teams, active learners)
- Quick actions (invite member, create team)
- Recent activity

**Settings Features:**
- Organization name and slug
- Branding (logo, primary color)
- Member settings (self-enrollment, approval required)

**Commit message:** `feat: add organization dashboard and settings pages`

---

## Task 5: Create Team Management Page

**Files:**
- Create: `src/app/org/teams/page.tsx`
- Create: `src/app/org/teams/[id]/page.tsx`

**Description:**
Create team management UI for creating teams, managing members, and viewing progress.

**Teams List Features:**
- List all teams with member count
- Create new team button
- Team cards with quick stats

**Team Detail Features:**
- Team info (name, description, manager)
- Member list with roles
- Add/remove members
- Team progress stats

**Commit message:** `feat: add team management pages`

---

## Task 6: Create Members Management Page

**Files:**
- Create: `src/app/org/members/page.tsx`
- Create: `src/components/enterprise/member-invite-dialog.tsx`
- Create: `src/components/enterprise/member-role-select.tsx`

**Description:**
Create member management UI for inviting users and managing roles.

**Features:**
- Member list with search and filter
- Invite member dialog (email, role selection)
- Change member role dropdown
- Remove member with confirmation
- Pending invitations list

**Commit message:** `feat: add member management page and invite dialog`

---

## Task 7: Create Enterprise Dashboard Widgets

**Files:**
- Create: `src/components/enterprise/dashboard-widgets.tsx`
- Modify: `src/app/org/page.tsx`

**Description:**
Add dashboard widgets showing organization-wide analytics.

**Widgets:**
- Active Learners (users active in last 7 days)
- Course Completions (this month vs last)
- Certifications Earned (by tier, by team)
- Top Performers (leaderboard by XP)
- At-Risk Learners (no activity in 14+ days)

**Commit message:** `feat: add enterprise dashboard widgets`

---

## Task 8: Add Organization Navigation

**Files:**
- Modify: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/org-switcher.tsx`

**Description:**
Add organization context to navigation with org switcher.

**Features:**
- Org switcher dropdown in sidebar header
- Enterprise nav items (Dashboard, Teams, Members, Settings)
- Show org nav only when user has org membership

**Commit message:** `feat: add organization navigation and switcher`

---

## Task 9: Create Enterprise Unit Tests

**Files:**
- Create: `src/lib/trpc/routers/__tests__/organization.test.ts`
- Create: `src/lib/auth/__tests__/org-permissions.test.ts`

**Description:**
Unit tests for organization router and permission helpers.

**Test Coverage:**
- Organization CRUD operations
- Member management (add, update, remove)
- Team management
- Permission checks for each role
- Data isolation between organizations

**Commit message:** `test: add organization router and permission tests`

---

## Task 10: Run Full Verification

**Steps:**
1. Run `pnpm typecheck` - fix any TypeScript errors
2. Run `pnpm test:unit` - ensure all tests pass
3. Run `pnpm build` - ensure build succeeds
4. Fix any issues found
5. Final commit

**Commit message:** `feat: complete Phase 5 - Enterprise`

---

## Phase 5 Completion Checklist

- [ ] Organization membership schema added
- [ ] Team membership schema added
- [ ] Organization tRPC router with CRUD
- [ ] Member management procedures
- [ ] Team management procedures
- [ ] Organization role middleware
- [ ] Permission helper functions
- [ ] Organization dashboard page
- [ ] Organization settings page
- [ ] Team management pages
- [ ] Member management page
- [ ] Invite member dialog
- [ ] Dashboard widgets
- [ ] Organization navigation
- [ ] Unit tests for router
- [ ] Unit tests for permissions
- [ ] TypeScript passes
- [ ] Build succeeds
- [ ] Tests pass
