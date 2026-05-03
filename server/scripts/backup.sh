#!/bin/bash
# Production MongoDB Backup Script

# Set variables
DB_NAME="studyrepo"
BACKUP_DIR="/var/backups/studyrepo/mongodb"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_PATH="$BACKUP_DIR/$DB_NAME-$DATE"
RETENTION_DAYS=7

echo "Starting database backup for $DB_NAME..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Execute mongodump
mongodump --db="$DB_NAME" --out="$BACKUP_PATH"

if [ $? -eq 0 ]; then
  echo "✅ Backup completed successfully: $BACKUP_PATH"
  
  # Compress the backup
  tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "$DB_NAME-$DATE"
  rm -rf "$BACKUP_PATH"
  echo "📦 Backup compressed: $BACKUP_PATH.tar.gz"
  
  # Clean up old backups
  find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -exec rm {} \;
  echo "🧹 Cleaned up backups older than $RETENTION_DAYS days."
else
  echo "❌ Backup failed!"
  exit 1
fi
