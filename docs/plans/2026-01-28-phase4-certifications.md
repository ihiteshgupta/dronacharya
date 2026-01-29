# Phase 4: Certifications - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Issue and verify Bronze/Silver/Gold certifications with PDF generation and LinkedIn sharing.

**Architecture:** tRPC certification router handles all flows. PDF generated server-side with puppeteer. Public verification page validates credentials.

**Tech Stack:** Next.js App Router, tRPC, Drizzle ORM, Puppeteer, QR Code

---

## Current State Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | certifications, assessments, assessment_questions tables |
| Certifications Page UI | ✅ Complete | Mock data, needs tRPC connection |
| tRPC Router | ❌ Missing | Need to create |
| PDF Generation | ❌ Missing | Need puppeteer |
| Verification Page | ❌ Missing | /verify/[certId] |
| LinkedIn Integration | ❌ Missing | Add-to-profile URL |

---

## Task 1: Install PDF Dependencies

**Files:**
- Modify: `package.json`

**Description:**
Install puppeteer for server-side PDF generation and qrcode for generating verification QR codes on certificates.

**Commands:**
```bash
pnpm add puppeteer qrcode
pnpm add -D @types/qrcode
```

**Commit message:** `chore: add puppeteer and qrcode dependencies for certificate generation`

---

## Task 2: Create Certification tRPC Router

**Files:**
- Create: `src/lib/trpc/routers/certification.ts`
- Modify: `src/lib/trpc/root.ts`

**Description:**
Create the certification router with procedures for checking eligibility, issuing certificates, listing user certificates, and public verification.

**Key Procedures:**
```typescript
// Check if user is eligible for a certification tier
certification.checkEligibility({ courseId, tier })

// Issue Bronze certificate (auto on 100% completion)
certification.issueBronze({ courseId })

// Start Silver exam (generates assessment)
certification.startSilverExam({ courseId })

// Submit Silver exam answers
certification.submitSilverExam({ assessmentId, answers })

// Submit Gold project
certification.submitGoldProject({ courseId, projectUrl, projectRepo, description })

// List user's certificates
certification.list()

// Get single certificate details
certification.get({ certificationId })

// Public verification (no auth required)
certification.verify({ credentialId })
```

**Bronze Logic:**
- Check all lessons in course are completed (progress.status = 'completed')
- Generate unique credentialId: `LF-{COURSE_CODE}-{YEAR}-{SEQUENCE}`
- Insert into certifications table with tier='bronze'

**Silver Logic:**
- Require Bronze first
- Use Quiz Generator agent to create 20-question exam
- Store in assessments table with type='certification_exam'
- On submission, grade with Assessor agent
- If score >= 80%, issue Silver

**Gold Logic:**
- Require Silver first
- Accept project URLs (deployed + repo)
- Use Project Guide agent for initial review
- Store with status='pending_review'
- Admin approves via separate procedure

**Commit message:** `feat: add certification tRPC router with Bronze/Silver/Gold flows`

---

## Task 3: Create Certificate PDF Generator

**Files:**
- Create: `src/lib/certificates/generator.ts`
- Create: `src/lib/certificates/templates.ts`

**Description:**
Server-side PDF generation using Puppeteer. Render HTML certificate template, convert to PDF. Include QR code for verification.

**Key Functions:**
```typescript
// Generate PDF buffer for a certification
generateCertificatePDF(certification: Certification): Promise<Buffer>

// Get HTML template for tier
getCertificateTemplate(tier: 'bronze' | 'silver' | 'gold'): string
```

**Template Requirements:**
- Bronze: Clean, simple design with course completion
- Silver: Elegant design with exam score
- Gold: Premium design with project details
- All include: Name, Course, Date, Credential ID, QR code to verify URL

**Commit message:** `feat: add certificate PDF generator with tier templates`

---

## Task 4: Create Certificate Download API Route

**Files:**
- Create: `src/app/api/certificates/[id]/download/route.ts`

**Description:**
API route that generates and returns PDF for a specific certification. Requires authentication, user must own the certificate.

**Route:**
```
GET /api/certificates/[id]/download
```

**Response:**
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="certificate-{credentialId}.pdf"

**Commit message:** `feat: add certificate PDF download API route`

---

## Task 5: Create Public Verification Page

**Files:**
- Create: `src/app/verify/[credentialId]/page.tsx`

**Description:**
Public page (no auth required) that displays certificate verification. Shows recipient name, course, tier, issue date, and validity status.

**Key Requirements:**
- Fetch certificate by credentialId via public tRPC procedure
- Display "Valid Certificate" badge if found
- Show certificate details
- Handle invalid/not found credentials gracefully
- SEO metadata for sharing

**Commit message:** `feat: add public certificate verification page`

---

## Task 6: Connect Certifications Page to tRPC

**Files:**
- Modify: `src/app/certifications/page.tsx`

**Description:**
Replace mock data with real tRPC queries. Add download and share functionality.

**Key Changes:**
- Use `trpc.certification.list.useQuery()` for user's certificates
- Use `trpc.course.list.useQuery()` for available courses (to show locked/available)
- Implement download button → calls download API
- Implement share button → copy verification URL or LinkedIn share

**LinkedIn Share URL:**
```
https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name={courseName}&organizationName=LearnFlow&issueYear={year}&issueMonth={month}&certUrl={verifyUrl}&certId={credentialId}
```

**Commit message:** `feat: connect certifications page to tRPC with download and share`

---

## Task 7: Create Certification Unit Tests

**Files:**
- Create: `src/lib/trpc/routers/__tests__/certification.test.ts`
- Create: `src/lib/certificates/__tests__/generator.test.ts`

**Description:**
Unit tests for certification router procedures and PDF generator.

**Test Coverage:**
- `checkEligibility`: returns correct eligibility for each tier
- `issueBronze`: creates certification with correct data
- `startSilverExam`: creates assessment with questions
- `submitSilverExam`: grades correctly, issues on pass
- `submitGoldProject`: creates pending certification
- `verify`: returns certificate data or null
- PDF generator: produces valid PDF buffer

**Commit message:** `test: add certification router and PDF generator tests`

---

## Task 8: Run Full Verification

**Steps:**
1. Run `pnpm typecheck` - fix any TypeScript errors
2. Run `pnpm test:unit` - ensure all tests pass
3. Run `pnpm build` - ensure build succeeds
4. Fix any issues found
5. Final commit

**Commit message:** `feat: complete Phase 4 - Certifications`

---

## Phase 4 Completion Checklist

- [ ] Dependencies installed (puppeteer, qrcode)
- [ ] Certification tRPC router with all procedures
- [ ] Bronze auto-issue on course completion
- [ ] Silver exam generation and grading
- [ ] Gold project submission flow
- [ ] PDF generation with tier templates
- [ ] Download API route working
- [ ] Public verification page
- [ ] Certifications page connected to real data
- [ ] LinkedIn share integration
- [ ] Unit tests for router and generator
- [ ] TypeScript passes
- [ ] Build succeeds
- [ ] Tests pass
