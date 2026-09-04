# Assignment: Pick a Bug Fix with `git cherry-pick` (with conflict)

## Scenario
The `hotfix/cache-bug` branch contains a critical fix that reduces the cache TTL to prevent stale order data. However, it also contains unfinished experimental features (`src/utils/cartHelper.js`). You only want the bug fix commit on your branch, without the experimental work.

The catch? Your current branch, `feature/cherry-pick`, also modified the cache TTL for performance testing. Cherry-picking the bug fix will result in a merge conflict that you must resolve.

## Your Tasks

### Step 1: Find the commit hash
View the commit history of the `hotfix/cache-bug` branch:
```bash
git log hotfix/cache-bug --oneline
```
Find the commit with the message `"fix: reduce cache TTL to prevent stale order data and add verification test"`. Note its commit hash.

### Step 2: Cherry-pick the commit
Ensure you are on the `feature/cherry-pick` branch, then run:
```bash
git cherry-pick <commit-hash>
```

Git will pause and tell you there is a conflict in `src/config/constants.js`.

### Step 3: Resolve the conflict
Open `src/config/constants.js`. You will see conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
Resolve the conflict by keeping the hotfix change (TTL of 15) and removing the markers. Save the file.

### Step 4: Complete the cherry-pick
```bash
git add src/config/constants.js
git cherry-pick --continue
```
Leave the commit message as is and save it.

### Step 5: Verify
```bash
npm run test tests/cache.test.js
```
The test should pass, confirming that the TTL was correctly set to 15!

```bash
git log -3 --oneline
```
You should see the fix commit at the top of your branch history, and `src/config/constants.js` should have `CACHE_TTL_SECONDS: 15`. `src/utils/cartHelper.js` should not exist.

## Expected Final State
- The `feature/cherry-pick` branch has exactly one new commit on top of your feature commit.
- The new commit is the one containing the cache TTL fix and the test case.
- The conflict in `src/config/constants.js` is resolved to keep the hotfix value.
- Running `npm run test tests/cache.test.js` passes successfully.
# Assignment: Clean Up a Messy Sprint History with Interactive Rebase

## Scenario
The payments feature was developed during a frantic sprint. The developer committed
frequently and messily — 12 commits across 5 files, including a commit that added
massive debug logging to half the codebase.

Your job is to use `git rebase -i` to produce a single, clean, professional commit.

## Your Tasks

### Step 1: Inspect the commit history
```bash
git log --oneline
```
You will see 12 commits on this branch (on top of the initial project commit).

### Step 2: Identify the "bad" commit
Find the commit with message `"debug: add verbose logging everywhere"`. This commit
added console.log spam to `paymentService.js`, `paymentController.js`, and
`database.js`. It must be **completely dropped**.

### Step 3: Launch interactive rebase
```bash
git rebase -i HEAD~12
```

In the editor:
- Change the FIRST commit's action from `pick` to `pick` (keep it as the base)
- Change all OTHER commits (except the debug one) to `squash` or `s`
- Change the `"debug: add verbose logging everywhere"` commit to `drop` or `d`

### Step 4: Write the final commit message
After dropping and squashing, git will prompt you for a final commit message.
Use exactly:
```
feat: implement payment processing module

Adds complete payment processing support including:
- Payment model with card validation
- Payment service with amount and card number validation
- Payment controller for REST endpoints
- Payment routes (POST /api/payments, GET /api/payments/:id)
- Unit tests for payment service
- Payment limits added to app constants
```

### Step 5: Verify the result
```bash
git log --oneline          # Should show exactly 2 commits (initial + your squashed one)
git show HEAD --stat       # Should show all payment files, NO debug logs anywhere
git diff HEAD -- src/config/constants.js  # Should contain PAYMENT_LIMITS
```

## Expected Final State
- Exactly ONE new commit on top of the base commit
- The commit contains all 5 payment files with clean, production-ready code
- NO debug console.log statements anywhere in the codebase
- Commit message matches exactly what is specified above
# Assignment: Resolve a Multi-File Merge Conflict

## Scenario
Two developers worked on the same files simultaneously during a sprint:

**You (feature/merge-conflict branch)** added:
- Pagination and filtering support to `GET /api/orders`
- A new `GET /api/orders/search` endpoint for full-text order search
- Enhanced test coverage in `tests/order.test.js`
- Updated `src/routes/orderRoutes.js` to include the search route
- Updated `src/middleware/errorHandler.js` to handle search-specific errors

**Your colleague (on main)** added:
- In-memory caching layer for the `GET /api/orders` endpoint
- Rate limiting middleware on all order routes to prevent abuse
- Also enhanced error handling in `src/middleware/errorHandler.js`

Both of you modified **5 of the same files**. When you try to merge main into your
branch, you will get conflicts in all 5 files.

## Your Tasks

### Step 1: Assess the situation
```bash
git log --oneline                             # See your 3 commits
git log --oneline main                        # See what main has
git diff HEAD...main --stat                   # Preview which files will conflict
```

### Step 2: Merge main into your branch
```bash
git merge main
```

### Step 3: Resolve conflict in `src/controllers/orderController.js`
- `getOrders`: Your version adds pagination (`page`, `limit`, `status`, `sort` query params).
  Main's version adds caching (cache lookup before DB call).
  **Resolution**: Combine both — check cache first, if miss then paginate, then cache the result.
- `searchOrders`: This is a new function you added. It doesn't exist in main.
  Keep it — just make sure the conflict markers around other functions are resolved.

### Step 4: Resolve conflict in `src/services/orderService.js`
- `getOrdersByUser`: Your version accepts pagination `options`. Main's version is unchanged.
  **Resolution**: Keep your paginated version. Main's callers will be updated.
- `searchOrders` (new service function): Keep this — it only exists on your branch.

### Step 5: Resolve conflict in `src/routes/orderRoutes.js`
- Your version adds a `search` route and imports `searchOrders`.
- Main's version adds rate limiting middleware to all routes.
- **Resolution**: Keep BOTH — apply rate limiting AND add the search route.

### Step 6: Resolve conflict in `src/middleware/errorHandler.js`
- Your version adds handling for MongoDB text search errors.
- Main's version adds handling for rate limit errors (429).
- **Resolution**: Keep BOTH error handlers.

### Step 7: Resolve conflict in `tests/order.test.js`
- Your version adds pagination tests for `getOrdersByUser`.
- Main's version adds cache invalidation tests.
- **Resolution**: Keep ALL test cases from both branches.

### Step 8: Complete the merge
```bash
git add src/controllers/orderController.js src/services/orderService.js \
        src/routes/orderRoutes.js src/middleware/errorHandler.js tests/order.test.js
git merge --continue
```
Write a merge commit message like: `merge: integrate main caching and rate limiting with pagination feature`

## Expected Final State
- `GET /api/orders` supports: pagination, filtering, AND caching
- `GET /api/orders/search` endpoint exists
- Rate limiting is applied to all order routes
- Error handler covers both rate-limit errors and search errors
- All test cases from both branches are present
# Assignment: Sync a Dependent Branch with Its Base Branch

## Scenario
You are on `feature/dependent-feature`, which was created from `feature/base-feature`.
Your branch adds a **User Profile API** that allows users to view and update their profiles.
This depends on the JWT authentication infrastructure from `feature/base-feature`.

While you were building the profile API, the security team discovered a **critical vulnerability**
in the JWT validation code on `feature/base-feature` and pushed an emergency security patch.

The patch on `feature/base-feature`:
1. Fixes a vulnerability where tokens without an `iss` (issuer) claim were being accepted
2. Adds `src/middleware/rateLimit.js` — a configurable rate limiting middleware
3. Updates `src/config/constants.js` with new security-related constants
4. **Also modified `src/routes/userRoutes.js`** to add the rate limiter to auth endpoints

**The problem**: You also modified `src/routes/userRoutes.js` to add your 3 new profile routes.
So when you sync with `feature/base-feature`, you will get a **conflict in userRoutes.js**.

## Your Tasks

### Step 1: Understand what changed on the base branch
```bash
git log --oneline feature/base-feature    # See the security patch commit
git diff HEAD feature/base-feature        # See all differences
git diff HEAD feature/base-feature -- src/routes/userRoutes.js   # See the route conflict
```

### Step 2: Bring in the security patch
Choose either merge or rebase:
```bash
git merge feature/base-feature
# OR
git rebase feature/base-feature
```
You will get a conflict in `src/routes/userRoutes.js`.

### Step 3: Resolve the conflict in `src/routes/userRoutes.js`
- **Your changes**: Added 3 profile routes (`GET /me/profile`, `PUT /me/profile`, `DELETE /me`)
- **Base branch changes**: Added `authRateLimiter` to `POST /register` and `POST /login`
- **Resolution**: Keep BOTH — apply rate limiting to auth routes AND include your profile routes

### Step 4: Verify the security patch is applied
```bash
git show feature/base-feature:src/middleware/authenticate.js | grep "iss"
# Should show the issuer claim check
cat src/middleware/authenticate.js  # Your branch should also have it now
cat src/middleware/rateLimit.js     # Should now exist on your branch
```

### Step 5: Complete the operation
```bash
# If merging:
git add src/routes/userRoutes.js
git merge --continue

# If rebasing:
git add src/routes/userRoutes.js
git rebase --continue
```

## Expected Final State
- `src/middleware/authenticate.js` has the `iss` claim security fix
- `src/middleware/rateLimit.js` exists (from base branch security patch)
- `src/routes/userRoutes.js` has: rate limiting on auth routes AND your 3 profile routes
- `src/controllers/userController.js` has the `getProfile`, `updateProfile`, `deleteAccount` controllers
# Assignment: Rebase with Multi-File Conflicts

## Scenario
You are working on the `feature/rebase-me` branch, which adds a **Discount Code System**
to the order management API.

While you were working on this, the team merged a **Tax Calculation System** into `main`.

Both changes heavily modified the same three files:
- `src/services/orderService.js` — both changed `calculateTotal()` and `createOrder()`
- `src/models/order.js` — both added new fields to the order schema
- `src/config/constants.js` — both added new config constants

## Your Tasks

### Step 1: Inspect the situation
```bash
git log --oneline                         # See your commits on this branch
git log --oneline main                    # See what main has that you don't
git diff HEAD main -- src/services/orderService.js   # Preview the differences
```

### Step 2: Start the rebase
```bash
git rebase main
```
Git will pause with conflict markers in **3 files**. Do NOT panic.

### Step 3: Resolve conflicts in `src/config/constants.js`
- Keep BOTH the `DISCOUNT_CONFIG` block (your change) AND the `TAX_CONFIG` block (from main)
- Keep BOTH the updated `ORDER_LIMITS` sections — merge them together

### Step 4: Resolve conflicts in `src/models/order.js`
- Keep BOTH the `discountCode` + `discountAmount` fields (your change)
  AND the `taxRate` + `taxAmount` fields (from main)
- The final schema should support both discounts AND taxes

### Step 5: Resolve conflicts in `src/services/orderService.js`
- `calculateTotal()` was changed by both branches:
  - Your version: accepts a `discountAmount` parameter
  - Main's version: accepts a `taxRate` parameter
  - **Resolution**: accept BOTH parameters: `calculateTotal(subtotal, discountAmount = 0, taxRate = 0)`
- Keep BOTH `applyDiscount()` (your function) AND `calculateTax()` (main's function)
- In `createOrder()`: include BOTH discount code handling AND tax calculation

### Step 6: Mark as resolved and continue
```bash
git add src/config/constants.js src/models/order.js src/services/orderService.js
git rebase --continue
```
Write a commit message if prompted, then complete the rebase.

### Step 7: Verify
```bash
git log --oneline                         # Your commits should now be on top of main
git diff main -- src/services/orderService.js   # Should show discount + tax features
```

## Expected Final State
- This branch is cleanly rebased on top of the latest `main`
- `orderService.js` has: `applyDiscount()`, `calculateTax()`, and `calculateTotal(subtotal, discountAmount, taxRate)`
- `order.js` schema has: `discountCode`, `discountAmount`, `taxRate`, `taxAmount` fields
- `constants.js` has: both `DISCOUNT_CONFIG` and `TAX_CONFIG` sections
# Assignment: Fix a Bad Commit with `git commit --amend`

## Scenario
A developer was rushing to finish the "JWT Authentication" feature before end of sprint.
They made one commit — but it was a DISASTER. The commit:

1. **Leaked production secrets**: accidentally committed a real `.env` file containing
   the database password and JWT secret to the repository.
2. **Left debug code in**: `src/controllers/userController.js` has a dozen `console.log`
   statements that were used during development and must be removed before production.
3. **Typo in commit message**: `"feat: add auth setup and login endpoit"` (missing 'n').

## Your Tasks

### Step 1: Inspect the damage
```bash
git log --oneline -5
git show HEAD --stat
git diff HEAD~1 HEAD
```

### Step 2: Remove the `.env` file from the commit
The `.env` file must NEVER be committed. Remove it from git's tracking:
```bash
git rm --cached .env
```
Then open `.gitignore` and make sure `.env` is listed (it should already be — just verify).

### Step 3: Remove debug console.logs
Open `src/controllers/userController.js` and remove ALL the `console.log` debug
statements (lines marked with `// DEBUG`). Keep the real logic intact.

### Step 4: Amend the commit
Stage all your changes and amend the last commit:
```bash
git add src/controllers/userController.js .gitignore
git commit --amend -m "feat: add JWT authentication middleware and login endpoint"
```

### Step 5: Verify
```bash
git log --oneline -3       # Should show the corrected commit message
git show HEAD --stat       # Should NOT show .env
git diff HEAD~1 HEAD -- .env  # Should show nothing (file was removed from commit)
```

## Expected Final State
- `.env` is NOT tracked by git (but exists locally for development)
- `.gitignore` includes `.env`
- `src/controllers/userController.js` has NO debug console.log lines
- The amend commit message is exactly: `feat: add JWT authentication middleware and login endpoint`
