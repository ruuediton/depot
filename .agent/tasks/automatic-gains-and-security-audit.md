# Task: Implement Automatic Gains and Security Audit

## 🎯 Goal
1.  **Automate Earnings**: Ensure `process_matured_investments` runs automatically without user intervention.
2.  **Security Review**: Audit the investment system for potential vulnerabilities and ensure correctness.

## 🛠️ Implementation Plan

### Phase 1: Automation Strategy (Database Level)
Since the frontend shouldn't be responsible for background tasks, we will implement a PostgreSQL scheduled job using `pg_cron` (Supabase standard).

- **Action**: Provide the SQL script to the user to enable `pg_cron` and schedule the maintenance function.
- **Alternative**: If `pg_cron` is not desired, implement a "Lazy Execution" trigger on the `profiles` table or during login.

### Phase 2: Security Audit
- Review `purchase_fund` logic (inferred from React code).
- Check for race conditions in balance updates.
- Verify that `p_auto_reinvest` logic is robust.
- Audit `Marketplace.tsx` for input sanitization and error handling.

### Phase 3: Verification
- Run available validation scripts (fixing the python issue if possible).
- Manual code walkthrough.

## 📝 SQL Proposed Changes (to be run in Supabase SQL Editor)

```sql
-- 1. Ensure pg_cron is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the processing of matured investments every hour
-- This replaces the need for the user to visit the Orders page.
SELECT cron.schedule(
    'process-matured-investments-hourly', -- name of the job
    '0 * * * *',                          -- every hour
    'SELECT process_matured_investments()' -- function to call
);

-- 3. Safety Check: Verify that process_matured_investments() is robust
-- and handles errors without crashing the cron job.
```

## ✅ Checklist
- [ ] earnings automation logic defined
- [ ] security review of RPC calls
- [ ] balance consistency check
- [ ] error handling verification
