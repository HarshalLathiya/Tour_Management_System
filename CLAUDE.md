# 🎯 Repository & PR Excellence Guide

## Maximum Score Achievement Strategy for SWE-Bench+ Evaluation

This guide helps you understand and maximize your repository evaluation score based on the `repo_evaluator.py` scoring system.

---

## 📊 Overall Score Breakdown

**Total Score Formula:**

```
Overall Score = (Repository Score × 0.6) + (PR Acceptance Rate × 100 × 0.4)
```

### Score Ratings:

- **≥ 70**: 🌟 **GREAT** - Excellent quality
- **≥ 50**: ✅ **GOOD** - Good quality with room for improvement
- **≥ 30**: ⚠️ **FAIR** - Needs significant improvements
- **< 30**: ❌ **POOR** - Not recommended

---

## 🏆 Repository Metrics (60% of Overall Score)

### Maximum Points: 100

#### 1. Test Coverage (40 points) 🧪

**Most Important Metric - 40% of repository score**

**Option A: Actual Coverage Reports (Preferred)**

- **100% coverage** = 40 points
- **80% coverage** = 32 points (⭐ Excellent threshold)
- **60% coverage** = 24 points (✅ Good threshold)
- **40% coverage** = 16 points (⚠️ Moderate threshold)

**Coverage Report Locations Checked:**

- `coverage.xml`, `coverage/coverage.xml`
- `lcov.info`, `coverage/lcov.info`
- `coverage-final.json`, `.nyc_output/coverage-final.json`

**Option B: Test File Ratio (Fallback)**

- **10% test files** = 40 points
- **5% test files** = 20 points
- **2.5% test files** = 10 points

**✅ Best Practices:**

- Use coverage tools: `pytest-cov`, `Istanbul`, `NYC`, `Cobertura`
- Generate coverage reports in CI/CD
- Aim for **≥80% coverage** for maximum points
- Alternative: Maintain **≥10% test file ratio**

**❌ Common Mistakes:**

- No coverage reports generated
- Test file ratio below 5%
- Tests not running in CI

---

#### 2. CI/CD Pipeline (15 points) 🔄

**Points:**

- Has CI/CD: **+15 points**
- No CI/CD: **0 points**

**Detected Files/Directories:**

- `.github/workflows/` (GitHub Actions)
- `.gitlab-ci.yml` (GitLab CI)
- `.travis.yml` (Travis CI)
- `Jenkinsfile` (Jenkins)
- `.circleci/` (CircleCI)
- `azure-pipelines.yml` (Azure Pipelines)
- `.drone.yml`, `buildkite.yml`

**✅ Best Practices:**

- Add at least one CI/CD workflow
- Configure automated testing
- Run tests on PRs and commits

**Example GitHub Actions:**

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: pytest --cov=src tests/
```

---

#### 3. Test Framework (15 points) 🛠️

**Points:**

- Has test framework: **+15 points**
- No test framework: **0 points**

**Detected Frameworks by Language:**

- **Python**: pytest, unittest
- **JavaScript/TypeScript**: jest, mocha, vitest
- **Java/Scala**: junit, scalatest
- **Ruby**: rspec
- **Go**: go test (files ending with `_test.go`)
- **Rust**: cargo test (`Cargo.toml` with test config)

**Detection Method:**

- Checks for framework indicators in:
  - `package.json`
  - `pyproject.toml`
  - `requirements.txt`
  - `build.gradle`
  - `pom.xml`
  - `Cargo.toml`
  - `go.mod`
  - Framework-specific config files

**✅ Best Practices:**

- Include test framework in dependencies
- Add framework config files
- Document testing setup in README

---

#### 4. Git Activity (15 points) 📈

**Points Based on Last 6 Months:**

- **>10 commits**: **+15 points** (Active development)
- **1-10 commits**: **+7 points** (Some activity)
- **0 commits**: **0 points** (Inactive)

**✅ Best Practices:**

- Maintain regular commit activity
- Aim for **>10 commits in 6 months**
- Make meaningful, incremental commits

---

#### 5. Issue Tracking (15 points) 🎫

**Points Based on Commits Referencing Issues:**

- **>20 references**: **+15 points** (Good tracking)
- **6-20 references**: **+10 points** (Some tracking)
- **1-5 references**: **+5 points**
- **0 references**: **0 points** (No tracking)

**Detection:**

- Searches git log for `#[0-9]` pattern
- Counts commits containing issue references like `#123`

**✅ Best Practices:**

- Reference issues in commits: `Fix #123`, `Closes #456`
- Link PRs to issues: `Fixes #789`
- Maintain organized issue tracking
- Aim for **>20 issue references**

**Example Commit Messages:**

```bash
git commit -m "Fix authentication bug (fixes #42)"
git commit -m "Add user profile feature (closes #67)"
git commit -m "Update dependencies (#89)"
```

---

### Repository Score Thresholds:

| Score | Rating       | Meaning                        |
| ----- | ------------ | ------------------------------ |
| ≥70   | 🌟 EXCELLENT | Highly suitable for SWE-Bench+ |
| ≥50   | ✅ GOOD      | Suitable with some limitations |
| ≥30   | ⚠️ FAIR      | Has significant gaps           |
| <30   | ❌ POOR      | Not recommended                |

---

## 🔍 PR Analysis (40% of Overall Score)

### PR Acceptance Rate Formula:

```
PR Score = (Accepted PRs / Total PRs) × 100
```

### PR Filter Chain

Every PR goes through **10 sequential filters**. If **ANY filter fails**, the PR is **REJECTED** with that specific reason.

---

### Filter 1: Merge Date ⏰

**Rejection Reason:** `merge_date`

**Condition:**

- PR merged before specified `--start-date`

**✅ How to Pass:**

- Only relevant if using `--start-date` flag
- Ensure PRs are within date range

---

### Filter 2: Creation Date 📅

**Rejection Reason:** `creation_date`

**Condition:**

- PR has no `createdAt` timestamp

**✅ How to Pass:**

- This should never fail for normal GitHub PRs
- Indicates data retrieval issue

---

### Filter 3: English Content 🌍

**Rejection Reason:** `content_not_in_english`

**Condition:**

- Title or body has <90% ASCII characters

**✅ How to Pass:**

- Write PR titles in English
- Write PR descriptions in English
- Keep special characters minimal
- Avoid excessive emojis/unicode

**Example:**

```markdown
✅ GOOD: "Fix authentication bug in user login"
❌ BAD: "修复用户登录认证错误" (non-English)
```

---

### Filter 4: Linked Issue Validation 🔗

**3 Sub-Filters (ALL must pass if issue is linked):**

#### 4a. Issue Type Check

**Rejection Reason:** `issue_is_a_pr`

**Condition:**

- Linked reference is a Pull Request, not an Issue

**✅ How to Pass:**

- Link to Issues, not other PRs
- Use proper closing keywords

#### 4b. Issue State Check

**Rejection Reason:** `issue_is_not_closed`

**Condition:**

- Linked issue is not in CLOSED state

**✅ How to Pass:**

- Only merge PRs when linked issues are CLOSED
- Close issues before merging PRs

#### 4c. Issue Word Count

**Rejection Reason:** `issue_word_count`

**Condition:**

- Issue body has <10 or >6000 words

**✅ How to Pass:**

- Write detailed issue descriptions
- Keep issue body between **10-6000 words**
- Include problem description, steps, context

**⚠️ IMPORTANT:**

- If NO issues are linked, these filters are **SKIPPED** (not rejected)
- If issues ARE linked, at least ONE must pass all 3 checks
- Issue detection uses:
  1. GraphQL `closingIssuesReferences`
  2. Regex fallback from PR body

**Closing Keywords Detected:**

- `Fixes #123`, `Closes #456`, `Resolves #789`
- `Fix #123`, `Close #456`, `Resolve #789`
- `Fixed #123`, `Closed #456`, `Resolved #789`

---

### Filter 5: Test File Count 🧪

**Rejection Reason:** `fewer_than_min_test_files`

**Default Configuration:**

- **Minimum**: 1 test file per PR

**Condition:**

- PR has fewer than minimum test files

**✅ How to Pass:**

- Include **at least 1 test file** in every PR
- Test files detected by:
  - Directories: `/test/`, `/tests/`, `__tests__/`, `/spec/`
  - Filenames: `.test.js`, `.spec.ts`, `_test.py`, `Test.java`
  - Language-specific patterns

**Example Test Files:**

```
✅ src/utils/helper.test.js
✅ tests/test_authentication.py
✅ spec/user_spec.rb
✅ src/main/java/UserTest.java
✅ src/lib_test.go
```

**⚠️ Common Mistake:**

- Documentation-only PRs with no tests
- Bug fixes without test coverage

---

### Filter 6: Non-Test File Count 📁

**Rejection Reason:** `more_than_max_non_test_files`

**Default Configuration:**

- **Maximum**: 100 non-test files per PR

**Condition:**

- PR modifies more than maximum non-test files

**✅ How to Pass:**

- Keep PRs focused and manageable
- Split large refactors into multiple PRs
- Stay under **100 modified files**

---

### Filter 7: Patch Retrieval 📥

**Rejection Reason:** `full_patch_retrieval`

**Condition:**

- Cannot retrieve full patch from GitHub API

**✅ How to Pass:**

- Ensure PR is properly merged
- This usually indicates API/network issues
- Rarely fails for valid PRs

---

### Filter 8: Rust Embedded Tests 🦀

**Rejection Reason:** `rust_embedded_tests`

**Condition (Rust projects only):**

- Source files contain embedded test code:
  - `#[test]`
  - `#[cfg(test)]`
  - `mod tests`
  - `#[tokio::test]`

**✅ How to Pass (Rust projects):**

- Keep tests in separate files
- Use `tests/` directory for integration tests
- Don't embed `#[test]` in source files

**Example Structure:**

```
✅ GOOD:
src/
  lib.rs          (no test code)
  module.rs       (no test code)
tests/
  integration_test.rs  (test code here)
  unit_test.rs         (test code here)

❌ BAD:
src/
  lib.rs          (contains #[test] functions)
  module.rs       (contains mod tests)
```

---

### Filter 9: Code Changes 💻

**Rejection Reason:** `code_changes_not_sufficient`

**Default Configuration:**

- **Minimum**: 1 line of source code changes

**Condition:**

- Source code additions + deletions < minimum

**What Counts as Code Changes:**

- ✅ Additions/deletions in source files
- ❌ NOT test files
- ❌ NOT asset files (images, configs, etc.)
- ❌ NOT blank lines
- ❌ NOT comments

**Calculation:**

```
source_changes = source_code_added + source_code_deleted
```

**✅ How to Pass:**

- Make **at least 1 line** of meaningful source code change
- Don't create PRs with only:
  - Documentation changes
  - Configuration updates
  - Test-only changes
  - Comment changes

**❌ Common Rejection Cases:**

- Documentation-only PRs
- README updates
- Config file changes
- Empty/no-op PRs

---

### Filter 10: Processing Errors ⚠️

**Rejection Reason:** `pr_processing_error`

**Condition:**

- Any exception during PR processing

**✅ How to Pass:**

- Ensure PR is properly formatted
- This usually indicates technical issues
- Rarely fails for valid PRs

---

## 🎯 Maximum Score Strategy

### To Achieve 80+ Overall Score:

#### Repository Score (Target: 85+)

1. **Test Coverage**: 32-40 points
   - Generate coverage reports (80-100%)
   - OR maintain 10%+ test file ratio

2. **CI/CD**: 15 points
   - Add GitHub Actions or similar

3. **Test Framework**: 15 points
   - Include pytest, jest, junit, etc.

4. **Git Activity**: 15 points
   - 10+ commits in 6 months

5. **Issue Tracking**: 13-15 points
   - 15+ commits referencing issues

#### PR Acceptance Rate (Target: 70%+)

- Aim for **70-90% acceptance rate**
- 70% acceptance = 28 PR score points
- Combined with 85 repo score = **79 overall**

### PR Creation Checklist:

- [ ] **English content** (title & description)
- [ ] **Link to issue** with 10-6000 word description
- [ ] **Close issue** before merging PR
- [ ] **Include ≥1 test file**
- [ ] **Make meaningful code changes** (≥1 line in source)
- [ ] **Keep files ≤100** modified files
- [ ] **Reference issue in commits** (`fixes #123`)
- [ ] **For Rust**: No embedded tests in source

---

## 📝 PR Template

Use this template to maximize acceptance rate:

```markdown
## Description

[Clear, English description of changes]

## Related Issue

Fixes #[issue-number]

## Changes Made

- Added feature X with tests
- Updated module Y
- Fixed bug Z

## Testing

- [ ] Added unit tests
- [ ] All tests passing
- [ ] Coverage maintained/improved

## Checklist

- [ ] Code follows project style
- [ ] Tests included
- [ ] Documentation updated
- [ ] Issue linked and closed
```

---

## 🚫 Common Rejection Reasons & Solutions

| Rejection                      | Why It Happens           | How to Fix                         |
| ------------------------------ | ------------------------ | ---------------------------------- |
| `fewer_than_min_test_files`    | No test files in PR      | Add at least 1 test file           |
| `code_changes_not_sufficient`  | Only docs/config changes | Include source code changes        |
| `issue_is_not_closed`          | Issue still open         | Close issue before merge           |
| `issue_word_count`             | Issue too short/long     | Write 10-6000 word issues          |
| `content_not_in_english`       | Non-English text         | Use English in titles/descriptions |
| `rust_embedded_tests`          | Tests in source files    | Move tests to separate files       |
| `more_than_max_non_test_files` | Too many files changed   | Split into smaller PRs             |

---

## 🔧 Configuration Options

The evaluator accepts these CLI arguments:

```bash
python repo_evaluator.py owner/repo \
  --github-token $TOKEN \
  --min-test-files 1 \        # Default: 1
  --max-non-test-files 100 \  # Default: 100
  --min-code-changes 1 \      # Default: 1
  --start-date 2024-01-01 \   # Optional
  --max-prs 50                # Optional
```

**Adjustable Parameters:**

- `--min-test-files`: Minimum test files per PR (default: 1)
- `--max-non-test-files`: Maximum non-test files per PR (default: 100)
- `--min-code-changes`: Minimum source code lines changed (default: 1)
- `--start-date`: Only evaluate PRs after this date (YYYY-MM-DD)
- `--max-prs`: Limit number of PRs analyzed

---

## 📊 Score Examples

### Example 1: Excellent Score (85)

- **Repository Score**: 95
  - Test Coverage: 40 (100% coverage)
  - CI/CD: 15 (GitHub Actions)
  - Test Framework: 15 (pytest)
  - Git Activity: 15 (50 commits/6mo)
  - Issue Tracking: 10 (15 issue refs)
- **PR Acceptance**: 60% (6/10 PRs)
- **Overall**: (95 × 0.6) + (60 × 0.4) = **81**

### Example 2: Good Score (65)

- **Repository Score**: 75
  - Test Coverage: 32 (80% coverage)
  - CI/CD: 15
  - Test Framework: 15
  - Git Activity: 7 (5 commits/6mo)
  - Issue Tracking: 6 (8 issue refs)
- **PR Acceptance**: 45% (9/20 PRs)
- **Overall**: (75 × 0.6) + (45 × 0.4) = **63**

### Example 3: Fair Score (45)

- **Repository Score**: 50
  - Test Coverage: 20 (5% test files)
  - CI/CD: 15
  - Test Framework: 15
  - Git Activity: 0 (no commits)
  - Issue Tracking: 0
- **PR Acceptance**: 30% (3/10 PRs)
- **Overall**: (50 × 0.6) + (30 × 0.4) = **42**

---

## 🎓 Key Takeaways

1. **Test coverage is king** - 40% of repository score
2. **Every PR needs tests** - Most common rejection reason
3. **Link and close issues** - Required if using issue tracking
4. **Maintain activity** - Regular commits boost score
5. **Keep PRs focused** - Avoid massive changes
6. **Write in English** - Required for PR acceptance
7. **Make real changes** - Documentation-only PRs are rejected
8. **Repository quality matters more** - 60% weight vs 40% for PRs

---

## 📚 Quick Reference

### Minimum Requirements for PR Acceptance:

✅ English title & description
✅ ≥1 test file
✅ ≥1 line of source code changes
✅ ≤100 modified files
✅ If issue linked: 10-6000 words & CLOSED state
✅ No embedded tests (Rust only)

### Optimal Repository Setup:

✅ 80%+ test coverage
✅ CI/CD pipeline
✅ Test framework configured
✅ 10+ commits per 6 months
✅ 20+ issue references in commits

---

**Remember:** Quality over quantity! Focus on creating well-tested, properly documented PRs that link to closed issues with meaningful code changes.

**Target Score:** Aim for 75+ overall score for GREAT rating! 🌟

---

---

# 🏗️ Tour Management System - Project-Specific Best Practices

This section contains development standards and best practices specifically tailored for this Tour Management System project.

---

## 🎨 Code Quality Standards

### TypeScript Best Practices

**Strict Type Safety:**

```typescript
// ✅ GOOD: Explicit types, no any
interface Tour {
  id: number;
  title: string;
  startDate: Date;
  participants: Participant[];
}

// ❌ BAD: Using any
function handleTour(data: any) { ... }
```

**File Organization:**

- Use barrel exports in `index.ts` files
- Keep files under 300 lines (split larger files)
- One component/function per file (except related utilities)

**Naming Conventions:**

```typescript
// Components: PascalCase
export function TourCard() {}

// Functions/variables: camelCase
const fetchTourData = async () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_PARTICIPANTS = 50;

// Types/Interfaces: PascalCase
interface UserProfile {}
type TourStatus = "active" | "completed";

// Private functions: _camelCase prefix
function _validateInternal() {}
```

### React/Next.js Standards

**Component Structure:**

```typescript
// ✅ GOOD: Clear separation of concerns
'use client';

import { useState, useEffect } from 'react';
import type { Tour } from '@/types';

interface TourCardProps {
  tour: Tour;
  onSelect?: (id: number) => void;
}

export function TourCard({ tour, onSelect }: TourCardProps) {
  // 1. Hooks
  const [isLoading, setIsLoading] = useState(false);

  // 2. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3. Event handlers
  const handleClick = () => {
    onSelect?.(tour.id);
  };

  // 4. Render
  return <div onClick={handleClick}>{tour.title}</div>;
}
```

**Server vs Client Components:**

- Default to Server Components unless you need:
  - useState, useEffect, event handlers
  - Browser-only APIs
  - Interactive UI elements
- Mark client components with `'use client'` directive
- Keep client components small and focused

### Express.js API Standards

**Route Handler Pattern:**

```typescript
// ✅ GOOD: Proper error handling and validation
router.post(
  "/tours",
  authenticateToken,
  authorizeRoles("org_admin", "super_admin"),
  async (req: Request, res: Response) => {
    try {
      // 1. Validate input
      const { title, startDate, endDate } = req.body;
      if (!title || !startDate || !endDate) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }

      // 2. Business logic
      const tour = await createTour(req.body);

      // 3. Success response
      res.status(201).json({
        success: true,
        data: tour,
      });
    } catch (error) {
      // 4. Error handling
      console.error("Tour creation error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  }
);
```

---

## 🔒 Security Best Practices

### Authentication & Authorization

**CRITICAL Security Rules:**

1. **Never expose sensitive data:**
   - ❌ Don't return passwords, even hashed
   - ❌ Don't log JWT tokens
   - ❌ Don't expose internal IDs in public APIs

2. **Always validate user permissions:**

```typescript
// ✅ GOOD: Check user owns resource
const tour = await getTourById(id);
if (tour.created_by !== req.user.id && req.user.role !== "super_admin") {
  return res.status(403).json({ error: "Forbidden" });
}
```

3. **Sanitize all inputs:**

```typescript
// ✅ GOOD: Sanitize user input
import { escape } from "mysql2";

const safeName = escape(req.body.name);
```

### Environment Variables

**Required in `.env.local`:**

```env
# Never commit these to git
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # Server-side only!

MYSQL_PASSWORD=  # Strong password
JWT_SECRET=      # 32+ character random string

# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000  # 15 minutes
```

**Security Checklist:**

- [ ] `.env.local` in `.gitignore`
- [ ] Rotate JWT secrets periodically
- [ ] Use HTTPS in production
- [ ] Implement rate limiting on auth endpoints
- [ ] Enable CORS only for trusted origins
- [ ] Validate file uploads (type, size, content)

### SQL Injection Prevention

**ALWAYS use parameterized queries:**

```typescript
// ✅ GOOD: Parameterized query
const [rows] = await pool.query("SELECT * FROM tours WHERE id = ?", [tourId]);

// ❌ BAD: String concatenation
const [rows] = await pool.query(
  `SELECT * FROM tours WHERE id = ${tourId}` // VULNERABLE!
);
```

### XSS Prevention

**Sanitize user-generated content:**

```typescript
// ✅ GOOD: Sanitize before rendering
import DOMPurify from "isomorphic-dompurify";

const cleanHTML = DOMPurify.sanitize(userInput);
```

---

## 🗄️ Database Best Practices

### MySQL Connection Pooling

**Optimal Configuration:**

```typescript
// server/db.ts
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT),
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on load
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: "+00:00", // Always use UTC
});

// Always use promise-based API
const promisePool = pool.promise();
```

### Query Optimization

**Index Usage:**

```sql
-- ✅ GOOD: Create indexes for frequent queries
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_attendance_tour_user ON attendance(tour_id, user_id);
CREATE INDEX idx_expenses_tour_category ON expenses(tour_id, category);

-- Composite indexes for common filter combinations
CREATE INDEX idx_tours_org_status_date ON tours(org_id, status, start_date);
```

**Query Performance:**

```typescript
// ✅ GOOD: Select only needed columns
const [tours] = await pool.query(
  "SELECT id, title, start_date, status FROM tours WHERE org_id = ?",
  [orgId]
);

// ❌ BAD: SELECT *
const [tours] = await pool.query("SELECT * FROM tours");

// ✅ GOOD: Use LIMIT for pagination
const [tours] = await pool.query("SELECT * FROM tours LIMIT ? OFFSET ?", [pageSize, offset]);
```

### Transaction Handling

**ACID Compliance for Critical Operations:**

```typescript
// ✅ GOOD: Use transactions for multi-table operations
const connection = await pool.getConnection();
await connection.beginTransaction();

try {
  // Create tour
  const [tourResult] = await connection.query("INSERT INTO tours (title, org_id) VALUES (?, ?)", [
    title,
    orgId,
  ]);
  const tourId = tourResult.insertId;

  // Create budget
  await connection.query("INSERT INTO budgets (tour_id, total_amount) VALUES (?, ?)", [
    tourId,
    budgetAmount,
  ]);

  // Commit transaction
  await connection.commit();

  return tourId;
} catch (error) {
  // Rollback on error
  await connection.rollback();
  throw error;
} finally {
  connection.release();
}
```

### Supabase Best Practices

**Row Level Security (RLS):**

```sql
-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Only admins can update
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'super_admin'
  );
```

**Efficient Queries:**

```typescript
// ✅ GOOD: Filter on server, select specific columns
const { data, error } = await supabase
  .from("tours")
  .select("id, title, start_date, status")
  .eq("org_id", orgId)
  .gte("start_date", startDate)
  .order("start_date", { ascending: true })
  .limit(20);

// ❌ BAD: Fetch all and filter client-side
const { data } = await supabase.from("tours").select("*");
const filtered = data.filter((t) => t.org_id === orgId);
```

---

## 🧪 Testing Strategy

### Test Coverage Requirements

**Target Coverage by File Type:**

- **Critical Business Logic**: 90%+ coverage
  - Authentication, authorization
  - Payment processing
  - Budget calculations
  - Attendance tracking
- **API Routes**: 80%+ coverage
- **UI Components**: 70%+ coverage
- **Utilities**: 95%+ coverage

### Testing Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /____\
     /      \  Integration Tests (30%)
    /________\
   /          \  Unit Tests (60%)
  /____________\
```

### Unit Tests

**Framework Setup:**

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
```

**Example Component Test:**

```typescript
// src/components/TourCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TourCard } from './TourCard';

describe('TourCard', () => {
  const mockTour = {
    id: 1,
    title: 'Paris Tour',
    startDate: new Date('2025-06-01'),
    status: 'active'
  };

  it('renders tour title', () => {
    render(<TourCard tour={mockTour} />);
    expect(screen.getByText('Paris Tour')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const handleSelect = vi.fn();
    render(<TourCard tour={mockTour} onSelect={handleSelect} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleSelect).toHaveBeenCalledWith(1);
  });
});
```

**Example API Test:**

```typescript
// server/routes/tours.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../index";

describe("POST /api/tours", () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Get auth token
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "password" });
    authToken = res.body.token;
  });

  it("creates tour with valid data", async () => {
    const res = await request(app)
      .post("/api/tours")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Test Tour",
        startDate: "2025-06-01",
        endDate: "2025-06-10",
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.title).toBe("Test Tour");
  });

  it("returns 401 without auth token", async () => {
    const res = await request(app).post("/api/tours").send({ title: "Test" });

    expect(res.status).toBe(401);
  });
});
```

### Integration Tests

**Database Integration:**

```typescript
// tests/integration/attendance.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { pool } from "@/server/db";

describe("Attendance Tracking", () => {
  beforeEach(async () => {
    // Clean database before each test
    await pool.query("DELETE FROM attendance WHERE tour_id = 999");
  });

  it("tracks attendance with geofencing", async () => {
    const checkIn = {
      tour_id: 999,
      user_id: 1,
      place_id: 5,
      latitude: 48.8566,
      longitude: 2.3522,
      timestamp: new Date(),
    };

    const [result] = await pool.query("INSERT INTO attendance SET ?", [checkIn]);

    expect(result.insertId).toBeGreaterThan(0);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/tour-creation.spec.ts
import { test, expect } from "@playwright/test";

test("admin can create new tour", async ({ page }) => {
  // Login
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "admin@test.com");
  await page.fill('[name="password"]', "password");
  await page.click('button[type="submit"]');

  // Navigate to tour creation
  await page.goto("/dashboard/tours/new");

  // Fill form
  await page.fill('[name="title"]', "E2E Test Tour");
  await page.fill('[name="startDate"]', "2025-06-01");
  await page.fill('[name="endDate"]', "2025-06-10");

  // Submit
  await page.click('button:has-text("Create Tour")');

  // Verify redirect and success
  await expect(page).toHaveURL(/\/dashboard\/tours\/\d+/);
  await expect(page.locator("h1")).toContainText("E2E Test Tour");
});
```

### Test File Naming

```
src/
  components/
    TourCard.tsx
    TourCard.test.tsx          ✅ Co-located unit tests

tests/
  unit/
    utils.test.ts              ✅ Utility unit tests
  integration/
    database.test.ts           ✅ Integration tests
  e2e/
    tour-creation.spec.ts      ✅ E2E tests
  fixtures/
    mockData.ts                ✅ Shared test data
```

---

## 🚀 Performance Guidelines

### Frontend Performance

**Code Splitting:**

```typescript
// ✅ GOOD: Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const PhotoGallery = dynamic(() => import('@/components/PhotoGallery'), {
  loading: () => <Skeleton />,
  ssr: false  // Client-side only if needed
});
```

**Image Optimization:**

```typescript
// ✅ GOOD: Use Next.js Image component
import Image from 'next/image';

<Image
  src={tour.imageUrl}
  alt={tour.title}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

**Data Fetching:**

```typescript
// ✅ GOOD: Use React Server Components for data fetching
async function TourList() {
  const tours = await fetchTours();  // Runs on server

  return (
    <div>
      {tours.map(tour => <TourCard key={tour.id} tour={tour} />)}
    </div>
  );
}

// ✅ GOOD: Cache API responses
import { unstable_cache } from 'next/cache';

const getCachedTours = unstable_cache(
  async () => fetchTours(),
  ['tours'],
  { revalidate: 60 }  // Revalidate every 60 seconds
);
```

### Backend Performance

**API Response Optimization:**

```typescript
// ✅ GOOD: Implement pagination
router.get("/tours", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const [tours] = await pool.query("SELECT * FROM tours LIMIT ? OFFSET ?", [limit, offset]);

  const [countResult] = await pool.query("SELECT COUNT(*) as total FROM tours");

  res.json({
    data: tours,
    pagination: {
      page,
      limit,
      total: countResult[0].total,
      totalPages: Math.ceil(countResult[0].total / limit),
    },
  });
});
```

**Caching Strategy:**

```typescript
// ✅ GOOD: Implement Redis caching for frequent queries
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

async function getTourById(id: number) {
  // Check cache first
  const cached = await redis.get(`tour:${id}`);
  if (cached) return JSON.parse(cached);

  // Fetch from database
  const [rows] = await pool.query("SELECT * FROM tours WHERE id = ?", [id]);
  const tour = rows[0];

  // Cache for 5 minutes
  await redis.set(`tour:${id}`, JSON.stringify(tour), "EX", 300);

  return tour;
}
```

**N+1 Query Prevention:**

```typescript
// ❌ BAD: N+1 query problem
const tours = await fetchTours();
for (const tour of tours) {
  tour.participants = await fetchParticipants(tour.id); // N queries!
}

// ✅ GOOD: Fetch all at once with JOIN
const [tours] = await pool.query(`
  SELECT
    t.*,
    JSON_ARRAYAGG(
      JSON_OBJECT('id', p.id, 'name', p.name)
    ) as participants
  FROM tours t
  LEFT JOIN participants p ON t.id = p.tour_id
  GROUP BY t.id
`);
```

---

## 📝 Documentation Standards

### Code Comments

**When to Comment:**

```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Use UTC to avoid timezone inconsistencies across global tours
const timestamp = new Date().toISOString();

// ✅ GOOD: Document complex business logic
/**
 * Calculate tour budget allocation across participants
 * Formula: (base_cost + (per_day_cost * days)) / participant_count
 *
 * Handles edge cases:
 * - Partial participant payments (pro-rated by days attended)
 * - Early bird discounts (before cutoff date)
 * - Group discounts (>10 participants get 15% off)
 */
function calculateParticipantFee(tour: Tour, participant: Participant): number {
  // implementation
}

// ❌ BAD: Obvious comments
const count = 0; // initialize count to zero
```

### API Documentation

**Use JSDoc for Route Handlers:**

```typescript
/**
 * Create a new tour
 *
 * @route POST /api/tours
 * @access Private - org_admin, super_admin only
 *
 * @param {string} title - Tour title (required)
 * @param {string} startDate - Start date in ISO format (required)
 * @param {string} endDate - End date in ISO format (required)
 * @param {number} orgId - Organization ID (required)
 * @param {string} description - Tour description (optional)
 *
 * @returns {Object} Created tour object with id
 *
 * @example
 * POST /api/tours
 * {
 *   "title": "Paris Cultural Tour",
 *   "startDate": "2025-06-01T00:00:00Z",
 *   "endDate": "2025-06-10T00:00:00Z",
 *   "orgId": 5
 * }
 *
 * @throws {400} Missing required fields
 * @throws {401} Unauthorized
 * @throws {403} Forbidden - insufficient permissions
 * @throws {500} Internal server error
 */
router.post("/tours", authenticateToken, authorizeRoles("org_admin"), async (req, res) => {
  // implementation
});
```

### README Documentation

**Required Sections:**

- Project overview
- Tech stack
- Prerequisites
- Installation steps
- Environment variables
- Database setup
- Running locally
- Testing
- Deployment
- Contributing guidelines
- License

---

## 🔄 Git Workflow & Commit Conventions

### Branch Strategy

**Branch Naming:**

```bash
# Feature branches
feature/attendance-qr-code
feature/budget-tracking

# Bug fixes
fix/login-redirect-loop
fix/attendance-timezone

# Hotfixes (production)
hotfix/security-patch-auth

# Chores (dependencies, configs)
chore/update-dependencies
chore/setup-ci-cd
```

### Conventional Commits

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Build process, dependencies

**Examples:**

```bash
feat(auth): add OAuth support for Google and GitHub

Implemented OAuth authentication flow using Supabase Auth.
Users can now sign in with their Google or GitHub accounts.

Closes #42

---

fix(attendance): resolve timezone discrepancy in check-ins

Attendance timestamps were being stored in local timezone
instead of UTC, causing issues for international tours.
Now all timestamps are normalized to UTC.

Fixes #87

---

perf(database): add indexes for frequently queried columns

Added composite indexes on tours and attendance tables
to optimize common query patterns. Query time reduced
from 2.5s to 150ms for tour listing.

Related to #103
```

### Commit Best Practices

**DO:**

- ✅ Make atomic commits (one logical change per commit)
- ✅ Write clear, descriptive commit messages
- ✅ Reference issues in commits (`fixes #123`)
- ✅ Commit working code (tests pass)
- ✅ Keep commits under 500 lines of changes

**DON'T:**

- ❌ Commit broken code
- ❌ Mix multiple unrelated changes
- ❌ Use vague messages ("fix bug", "update code")
- ❌ Commit sensitive data (.env files, secrets)
- ❌ Commit generated files (node_modules, build artifacts)

---

## 👀 Code Review Guidelines

### PR Author Checklist

Before requesting review:

- [ ] All tests pass locally
- [ ] Code follows project style guide
- [ ] No console.logs or debug code
- [ ] TypeScript types are properly defined (no `any`)
- [ ] Error handling is implemented
- [ ] Environment variables documented
- [ ] Database migrations included (if schema changed)
- [ ] PR description explains WHY, not just WHAT
- [ ] Screenshots/videos for UI changes
- [ ] Self-review completed

### Reviewer Checklist

**Functionality:**

- [ ] Code does what PR description claims
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No breaking changes (or properly documented)

**Code Quality:**

- [ ] Code is readable and maintainable
- [ ] No unnecessary complexity
- [ ] Follows DRY principle
- [ ] Proper naming conventions
- [ ] No hardcoded values (use constants/config)

**Security:**

- [ ] No SQL injection vulnerabilities
- [ ] User input is validated/sanitized
- [ ] Authentication/authorization correct
- [ ] No secrets in code
- [ ] XSS prevention implemented

**Performance:**

- [ ] No N+1 query problems
- [ ] Database queries are optimized
- [ ] Proper indexing used
- [ ] No unnecessary re-renders (React)
- [ ] Images are optimized

**Testing:**

- [ ] Tests cover new functionality
- [ ] Tests are meaningful (not just coverage)
- [ ] Edge cases are tested
- [ ] Integration tests for API changes

### Review Feedback Examples

**Constructive Feedback:**

````markdown
✅ GOOD:
"Consider extracting this logic into a separate utility function
for better reusability. Something like:

```typescript
function validateTourDates(startDate: Date, endDate: Date): boolean {
  return endDate > startDate && startDate > new Date();
}
```
````

This would make the code more testable and reusable across components."

❌ BAD:
"This code is messy. Refactor it."

````

**Asking Questions:**
```markdown
✅ GOOD:
"I noticed we're not handling the case where `participants` is undefined.
Should we add a null check here, or is this guaranteed to always exist?"

❌ BAD:
"This will crash if participants is undefined."
````

---

## 🐛 Error Handling & Logging

### Error Handling Patterns

**Frontend Error Boundaries:**

```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**API Error Responses:**

```typescript
// server/utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

// Global error handler middleware
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Unhandled errors
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}
```

**Usage in Routes:**

```typescript
router.get("/tours/:id", async (req, res, next) => {
  try {
    const tourId = parseInt(req.params.id);

    if (isNaN(tourId)) {
      throw new ValidationError("Invalid tour ID");
    }

    const tour = await getTourById(tourId);

    if (!tour) {
      throw new NotFoundError("Tour");
    }

    res.json({ success: true, data: tour });
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
});
```

### Logging Best Practices

**Structured Logging:**

```typescript
// server/utils/logger.ts
import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "tour-management-api" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;

// Usage
logger.info("User logged in", { userId: user.id, email: user.email });
logger.error("Database query failed", { query, error: error.message });
logger.warn("High memory usage", { usage: process.memoryUsage() });
```

**What to Log:**

- ✅ Authentication events (login, logout, failures)
- ✅ Authorization failures
- ✅ Database errors
- ✅ API errors (4xx, 5xx)
- ✅ Performance metrics (slow queries)
- ✅ Business events (tour created, payment processed)

**What NOT to Log:**

- ❌ Passwords (even hashed)
- ❌ JWT tokens
- ❌ Credit card numbers
- ❌ Personal identification numbers
- ❌ API keys/secrets

---

## 🎯 Project-Specific Guidelines

### Tour Management Domain

**Business Logic Validation:**

```typescript
// ✅ GOOD: Validate business rules
function validateTourDates(tour: TourInput): void {
  const start = new Date(tour.startDate);
  const end = new Date(tour.endDate);
  const now = new Date();

  if (start < now) {
    throw new ValidationError("Tour start date must be in the future");
  }

  if (end <= start) {
    throw new ValidationError("Tour end date must be after start date");
  }

  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (duration > 365) {
    throw new ValidationError("Tour duration cannot exceed 1 year");
  }
}
```

**Geolocation Validation:**

```typescript
// ✅ GOOD: Validate coordinates
function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// ✅ GOOD: Calculate distance for geofencing
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWithinGeofence(
  userLat: number,
  userLng: number,
  placeLat: number,
  placeLng: number,
  radiusKm: number = 0.5 // 500m default
): boolean {
  const distance = calculateDistance(userLat, userLng, placeLat, placeLng);
  return distance <= radiusKm;
}
```

### File Upload Handling

**Secure File Uploads:**

```typescript
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "application/msword"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(new ValidationError("Invalid file type"), false);
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
```

---

## 🔧 Development Environment Setup

### Recommended VS Code Extensions

**Required:**

- ESLint - Code linting
- Prettier - Code formatting
- TypeScript Vue Plugin (Volar) - TypeScript support

**Highly Recommended:**

- Tailwind CSS IntelliSense - Tailwind autocompletion
- Error Lens - Inline error display
- GitLens - Git integration
- Thunder Client / REST Client - API testing
- Database Client - MySQL/PostgreSQL management

### VS Code Settings

**`.vscode/settings.json`:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "**/.git": true,
    "**/.next": true,
    "**/node_modules": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  }
}
```

### Package Scripts

**Recommended `package.json` scripts:**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "db:migrate": "node server/init-db.ts",
    "db:seed": "node server/seed-db.ts",
    "server:dev": "bun run server/index.ts"
  }
}
```

---

## 📊 Monitoring & Analytics

### Performance Monitoring

**Add Web Vitals Tracking:**

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Track Custom Events:**

```typescript
// lib/analytics.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, properties);
  }
}

// Usage
trackEvent("tour_created", {
  tourId: tour.id,
  duration: tour.duration,
  participantCount: tour.participants.length,
});
```

### Error Tracking

**Integrate Sentry (Recommended):**

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  },
});
```

---

## 🎓 Additional Resources

### Learning Materials

**Next.js 14:**

- [Next.js Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)

**TypeScript:**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

**Testing:**

- [Vitest Guide](https://vitest.dev/guide/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/)

**Database:**

- [MySQL Best Practices](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [Supabase Guides](https://supabase.com/docs/guides)

---

## 📋 Quick Reference Checklists

### Before Every Commit

- [ ] Run `npm run lint`
- [ ] Run `npm run type-check`
- [ ] Run `npm test`
- [ ] Review your changes (git diff)
- [ ] Write meaningful commit message
- [ ] Reference issue number if applicable

### Before Every PR

- [ ] All tests pass
- [ ] Code coverage maintained/improved
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] Environment variables documented
- [ ] Database migrations included (if needed)
- [ ] Screenshots for UI changes
- [ ] Linked to issue with proper closing keyword
- [ ] Self-review completed

### Before Deployment

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] CORS settings correct
- [ ] Rate limiting enabled
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

---

## 🎯 Success Metrics

Track these metrics to maintain high quality:

**Code Quality:**

- Test coverage: **>80%**
- TypeScript strict mode: **No `any` types**
- ESLint warnings: **0**
- Bundle size: **<500KB initial load**

**Performance:**

- Lighthouse score: **>90**
- First Contentful Paint: **<1.5s**
- Time to Interactive: **<3.5s**
- API response time: **<200ms (p95)**

**Reliability:**

- Uptime: **>99.9%**
- Error rate: **<0.1%**
- Failed deployments: **<5%**

**Development Velocity:**

- PR review time: **<24 hours**
- Deploy frequency: **Multiple per week**
- Mean time to recovery: **<1 hour**

---

**Remember:** Quality is not an act, it is a habit. Following these best practices consistently will result in a maintainable, scalable, and robust Tour Management System. 🚀
