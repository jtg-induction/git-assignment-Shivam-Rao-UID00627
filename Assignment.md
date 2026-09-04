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
