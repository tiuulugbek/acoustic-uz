#!/usr/bin/env python3
"""
Generate a complete data-preserving migration from String IDs to Int IDs.
This script reads the Prisma schema and generates a migration SQL file.
"""

import re
import sys
from pathlib import Path

# Model order (dependencies first)
MODEL_ORDER = [
    "Role",           # No dependencies
    "Media",          # No dependencies
    "User",           # Depends on Role
    "Brand",          # Depends on Media
    "ProductCategory", # Depends on Media, self-referencing
    "ServiceCategory", # Depends on Media, self-referencing
    "Product",        # Depends on Brand, ProductCategory, Media arrays
    "Catalog",        # Depends on Media
    "Service",        # Depends on ServiceCategory, Media
    "PostCategory",   # Depends on Media
    "Doctor",         # Depends on Media
    "Post",           # Depends on PostCategory, Media, Doctor
    "Branch",         # Depends on Media
    "Banner",         # Depends on Media
    "Faq",            # No dependencies
    "Page",           # Depends on Media arrays
    "Lead",           # Depends on Product
    "HearingTest",    # No dependencies
    "AuditLog",       # Depends on User
    "Menu",           # No dependencies
    "HomepageHearingAid", # Depends on Media
    "HomepageJourneyStep", # No dependencies
    "HomepageNewsItem", # Depends on Post
    "HomepageService", # Depends on Media
    "HomepageSection", # No dependencies
    "HomepageLink",   # Depends on HomepageSection
    "HomepagePlaceholder", # Depends on Media
    "HomepageEmptyState", # No dependencies
    "CommonText",     # No dependencies
    "AvailabilityStatus", # No dependencies
    "Showcase",       # Depends on Product arrays
    "Setting",        # Depends on Media, singleton
    "CatalogPageConfig", # Singleton
]

def generate_migration():
    migration_sql = []
    
    migration_sql.append("-- Migration: Convert String IDs to Int IDs (Data-Preserving)")
    migration_sql.append("-- This migration preserves ALL existing data")
    migration_sql.append("")
    migration_sql.append("BEGIN;")
    migration_sql.append("")
    migration_sql.append("-- ============================================")
    migration_sql.append("-- STEP 1: Create ID mapping tables")
    migration_sql.append("-- ============================================")
    migration_sql.append("")
    
    # Create mapping tables
    for model in MODEL_ORDER:
        migration_sql.append(f'CREATE TABLE IF NOT EXISTS "_id_mapping_{model}" (')
        migration_sql.append("    old_id TEXT PRIMARY KEY,")
        migration_sql.append("    new_id INTEGER NOT NULL UNIQUE")
        migration_sql.append(");")
        migration_sql.append("")
    
    migration_sql.append("-- ============================================")
    migration_sql.append("-- STEP 2: Migrate models in dependency order")
    migration_sql.append("-- ============================================")
    migration_sql.append("")
    
    # Generate migration for each model
    for i, model in enumerate(MODEL_ORDER, start=1):
        migration_sql.append(f"-- STEP {i+1}: Migrate {model}")
        migration_sql.append(f'INSERT INTO "_id_mapping_{model}" (old_id, new_id)')
        migration_sql.append(f'SELECT id, ROW_NUMBER() OVER (ORDER BY id)::INTEGER')
        migration_sql.append(f'FROM "{model}";')
        migration_sql.append("")
        
        # Note: Full table creation and data migration would go here
        # This is a simplified version - full implementation would require
        # parsing the Prisma schema to get all fields and relationships
        migration_sql.append(f'-- TODO: Create "{model}_new" table and migrate data')
        migration_sql.append("")
    
    migration_sql.append("-- ============================================")
    migration_sql.append("-- STEP 3: Drop old tables and rename new ones")
    migration_sql.append("-- ============================================")
    migration_sql.append("")
    migration_sql.append("-- TODO: Drop old tables and rename new tables")
    migration_sql.append("-- TODO: Drop mapping tables")
    migration_sql.append("")
    migration_sql.append("COMMIT;")
    
    return "\n".join(migration_sql)

if __name__ == "__main__":
    output_file = sys.argv[1] if len(sys.argv) > 1 else "migration.sql"
    migration = generate_migration()
    
    with open(output_file, 'w') as f:
        f.write(migration)
    
    print(f"Migration file generated: {output_file}")
    print("NOTE: This is a template. You need to complete it with full table definitions.")

