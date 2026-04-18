#!/bin/sh
set -eu

echo "Starting Laravel container"

PORT="${PORT:-8000}"
DB_CONNECTION="${DB_CONNECTION:-mysql}"

echo "Clearing cached configuration"
php artisan optimize:clear

if [ "$DB_CONNECTION" = "mysql" ]; then
  echo "Waiting for MySQL to accept connections"

  until php -r "
  try {
      new PDO(
          'mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE'),
          getenv('DB_USERNAME'),
          getenv('DB_PASSWORD')
      );
      exit(0);
  } catch (Throwable \$e) {
      fwrite(STDERR, \$e->getMessage() . PHP_EOL);
      exit(1);
  }
  "; do
    echo "Database not ready yet, retrying in 2s"
    sleep 2
  done
fi

echo "Running migrations"
php artisan migrate --force

echo "Starting Laravel server on port ${PORT}"
exec php artisan serve --host=0.0.0.0 --port="${PORT}"
