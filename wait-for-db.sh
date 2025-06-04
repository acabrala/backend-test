#!/bin/bash
# wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

until pg_isready -h "$host" -p 5432 > /dev/null 2>&1; do
  echo "Waiting for database..."
  sleep 1
done

>&2 echo "Database is up - executing command"
exec $cmd
