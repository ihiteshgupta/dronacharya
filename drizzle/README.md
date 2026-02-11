# Database Migrations

This directory contains Drizzle ORM migrations for Dronacharya.

## Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Push schema directly to database (development only)
pnpm db:push

# Run pending migrations
pnpm db:migrate

# Open Drizzle Studio for database exploration
pnpm db:studio
```

## Migration Workflow

### Development
1. Make changes to schema in `src/lib/db/schema/`
2. Run `pnpm db:push` to sync schema to dev database
3. Test your changes

### Production
1. Make changes to schema in `src/lib/db/schema/`
2. Run `pnpm db:generate` to create migration file
3. Review generated migration in `drizzle/` directory
4. Commit migration file
5. Deploy - CI/CD will run `pnpm db:migrate` automatically

## Environment Setup

Ensure `DATABASE_URL` is set in `.env.local`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/dronacharya
```

## Migration Files

Migrations are stored in this directory with timestamp-prefixed names:
- `0000_initial_schema.sql`
- `0001_add_onboarding_fields.sql`
- etc.

The `meta/` subfolder contains migration metadata (do not edit manually).

## Troubleshooting

### Migration Conflicts
If you have local schema changes that conflict with migrations:
1. Back up your data
2. Drop and recreate the database
3. Run `pnpm db:migrate` to apply all migrations
4. Restore data if needed

### Schema Drift
To check if your database matches the schema:
```bash
pnpm drizzle-kit check:pg
```
