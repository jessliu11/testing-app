# Supabase Database Management Guide

## 🗄️ Database Overview

You have **two** Supabase cloud instances:

| Environment | Project Ref | URL | Purpose |
|------------|-------------|-----|---------|
| **DEV** | `iauntkomrwmfuhcatjzc` | https://iauntkomrwmfuhcatjzc.supabase.co | Development & testing |
| **PROD** | `kpbizmazonrsuvnzxdcq` | https://kpbizmazonrsuvnzxdcq.supabase.co | Live user-facing app |

Plus a **local** Supabase instance running in Docker at `http://127.0.0.1:54321` for fast iteration.

---

## 🔍 How to Know Which Database You're Using

### Check Current Link
```bash
supabase status
# Look for "Linked project:" in output
```

### Check Environment Variables
```bash
# Development (local .env.local)
cat .env.local
# Should show: iauntkomrwmfuhcatjzc (DEV)

# Production (deployment platform)
# Check Vercel/Netlify dashboard environment variables
# Should show: kpbizmazonrsuvnzxdcq (PROD)
```

---

## 🚀 Common Workflows

### Working on DEV Database

1. **Link to DEV:**
   ```bash
   supabase link --project-ref iauntkomrwmfuhcatjzc
   ```

2. **Verify you're on DEV:**
   ```bash
   supabase status | grep "Linked project"
   ```

3. **Push migrations:**
   ```bash
   supabase db push
   ```

4. **Import/update data:**
   ```bash
   SUPABASE_URL=https://iauntkomrwmfuhcatjzc.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=<your_dev_service_key> \
   node scripts/import-items.mjs --file supabase/data/taylor_swift_items.csv
   ```

5. **Test locally against DEV:**
   ```bash
   # Ensure .env.local points to DEV
   npm run dev
   ```

### Working on PROD Database

⚠️ **WARNING: Always test on DEV first!**

1. **Link to PROD:**
   ```bash
   supabase link --project-ref kpbizmazonrsuvnzxdcq
   ```

2. **VERIFY you're on PROD (double-check!):**
   ```bash
   supabase status | grep "Linked project"
   # Should show: kpbizmazonrsuvnzxdcq
   ```

3. **Push migrations:**
   ```bash
   supabase db push
   ```

4. **Import/update data:**
   ```bash
   SUPABASE_URL=https://kpbizmazonrsuvnzxdcq.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=<your_prod_service_key> \
   node scripts/import-items.mjs --file supabase/data/taylor_swift_items.csv
   ```

5. **Deploy frontend:**
   ```bash
   npm run build
   git add .
   git commit -m "Update: description"
   git push
   ```

### Working Locally (Fast Iteration)

1. **Start local Supabase:**
   ```bash
   supabase start
   ```

2. **Reset & seed local database:**
   ```bash
   supabase db reset
   # This applies all migrations + seed.sql
   ```

3. **Point .env.local to local:**
   ```bash
   # Edit .env.local:
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   ```

4. **Run dev server:**
   ```bash
   npm run dev
   ```

---

## 🛡️ Safety Checklist

### Before Pushing to PROD

- [ ] Test migration on local Supabase first (`supabase db reset`)
- [ ] Test on DEV database
- [ ] Verify migration works in both environments
- [ ] **Double-check** you're linked to the correct project (`supabase status`)
- [ ] Have a backup plan (migrations are version controlled in git)

### Before Importing Data to PROD

- [ ] Test import script on local database first
- [ ] Test on DEV database
- [ ] Verify data looks correct in DEV
- [ ] **Triple-check** the SUPABASE_URL in your import command
- [ ] Consider backing up PROD first (optional)

---

## 📋 Quick Reference Commands

### Check Which Database You're On
```bash
supabase status | grep "Linked project"
```

### Switch Between Databases
```bash
# Switch to DEV
supabase link --project-ref iauntkomrwmfuhcatjzc

# Switch to PROD
supabase link --project-ref kpbizmazonrsuvnzxdcq
```

### View Remote Database
```bash
# Open Supabase Studio for current linked project
supabase db remote status

# Or visit in browser:
# DEV: https://supabase.com/dashboard/project/iauntkomrwmfuhcatjzc
# PROD: https://supabase.com/dashboard/project/kpbizmazonrsuvnzxdcq
```

### Compare Local vs Remote Schema
```bash
supabase db diff --linked
```

### Pull Schema from Remote
```bash
# Pull from currently linked project
supabase db pull
```

---

## 🔑 Environment Variables Reference

### Local Development (.env.local)
```bash
# Option A: Use DEV cloud database (recommended for testing with real data)
VITE_SUPABASE_URL=https://iauntkomrwmfuhcatjzc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhdW50a29tcndtZnVoY2F0anpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTc1MjQsImV4cCI6MjA4NDkzMzUyNH0.igTjUPT7QBN9copxEVZheliyFfaDEKgFqD6CtW0Fv_0

# Option B: Use local Supabase (fast iteration, no internet needed)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Production (Deployment Platform - Vercel/Netlify)
Set these in your deployment platform dashboard:
```bash
VITE_SUPABASE_URL=https://kpbizmazonrsuvnzxdcq.supabase.co
VITE_SUPABASE_ANON_KEY=<your_prod_anon_key>
```

---

## 🚨 Emergency: "I Pushed to the Wrong Database!"

If you accidentally pushed migrations to the wrong database:

1. **Don't panic** - migrations are versioned in git
2. **Check what was applied:**
   ```bash
   supabase db remote status
   ```
3. **Rollback if needed:**
   - Migrations can't be automatically rolled back
   - You'll need to create a new migration that reverses the changes
   - Or restore from a backup if you have one

**Prevention:** Always run `supabase status` before `supabase db push`

---

## 📝 Best Practices

1. **Always develop migrations locally first**
2. **Test on DEV before PROD**
3. **Use git branches** for feature work
4. **Commit migrations** to version control
5. **Document breaking changes** in migration files
6. **Keep .env.local in .gitignore** (it's already there)
7. **Never commit service role keys** to git

---

## 🎯 Recommended Development Flow

```
1. Create migration locally
   ↓
2. Test with local Supabase (supabase db reset)
   ↓
3. Test with DEV cloud database
   ↓
4. Commit migration to git
   ↓
5. Push to PROD
   ↓
6. Deploy frontend
```
