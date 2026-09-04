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
