#!/bin/sh

echo "Aguardando banco..."
sleep 5

echo "Rodando migrations..."
php artisan migrate --force

echo "Iniciando servidor..."
php artisan serve --host=0.0.0.0 --port=$PORT