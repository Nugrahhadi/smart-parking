# Sequelize Migration Setup Guide

## 📦 Installation

```bash
cd Server
npm install --save sequelize mysql2
npm install --save-dev sequelize-cli
```

## 🚀 Initialize Sequelize

```bash
npx sequelize-cli init
```

This will create:

- `config/config.json` - Database configuration
- `models/` - Sequelize models
- `migrations/` - Migration files
- `seeders/` - Seed data files

## ⚙️ Configure Database

Edit `Server/config/config.json`:

```json
{
  "development": {
    "username": "root",
    "password": "",
    "database": "parking_system",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "parking_system_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "parking_system_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

## 📝 Migrations

### ✅ Migration 1: Create All Tables (COMPLETED)

**File:** `migrations/20251011051543-create-all-tables.js`

This migration creates all 7 tables with zone_type ENUM already implemented:

- users
- parking_locations
- parking_spots (with zone_type ENUM)
- vehicles
- reservations
- payments
- notifications

All foreign keys, indexes, and constraints are included.

### Creating New Migrations

To create additional migrations in the future:

```bash
# Example: Add a new field to a table
npx sequelize-cli migration:generate --name add-rating-to-parking-locations
```

## 🎯 Run Migrations

```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Check migration status
npx sequelize-cli db:migrate:status
```

## 🌱 Create Seeders

```bash
# Create seed for parking locations
npx sequelize-cli seed:generate --name demo-parking-locations

# Create seed for parking spots
npx sequelize-cli seed:generate --name demo-parking-spots

# Create seed for users
npx sequelize-cli seed:generate --name demo-users
```

## 🎽 Run Seeders

```bash
# Run all seeders
npx sequelize-cli db:seed:all

# Undo last seeder
npx sequelize-cli db:seed:undo

# Undo all seeders
npx sequelize-cli db:seed:undo:all
```

## 📊 Migration Files Structure

See the migration files in `Server/migrations/` directory.

Each migration has:

- `up` method: Applied when running migration
- `down` method: Applied when rolling back

## 🔄 Complete Setup Flow

```bash
# 1. Install dependencies
cd Server
npm install --save sequelize mysql2
npm install --save-dev sequelize-cli

# 2. Initialize Sequelize
npx sequelize-cli init

# 3. Configure database (edit config/config.json)

# 4. Create migrations (files already provided)

# 5. Run migrations
npx sequelize-cli db:migrate

# 6. Run seeders
npx sequelize-cli db:seed:all

# 7. Verify in MySQL
# Tables should be created with data
```

## ✅ Verification

```sql
-- Check if migrations table exists
SHOW TABLES LIKE 'SequelizeMeta';

-- Check migrations run
SELECT * FROM SequelizeMeta;

-- Check tables
SHOW TABLES;

-- Check data
SELECT * FROM parking_locations;
SELECT * FROM parking_spots WHERE zone_type = 'VIP Royal Zone';
SELECT * FROM users;
```

## 🛠️ Troubleshooting

### Error: "Sequelize CLI is not installed"

```bash
npm install --save-dev sequelize-cli
```

### Error: "Database doesn't exist"

```sql
CREATE DATABASE parking_system;
```

### Error: "Migration already executed"

```bash
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate
```

### Reset Everything

```bash
# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Drop database
mysql -u root -e "DROP DATABASE IF EXISTS parking_system; CREATE DATABASE parking_system;"

# Run migrations again
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## 📚 Resources

- [Sequelize Documentation](https://sequelize.org/)
- [Sequelize CLI Documentation](https://github.com/sequelize/cli)
- [Sequelize Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)
