#!/bin/bash
# Script to review migration file on server

echo "To review migration file on server, run:"
echo "sudo cat /var/www/acoustic.uz/apps/backend/prisma/migrations/*change_ids_to_int*/migration.sql | head -100"
