FROM php:8.4-cli

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev zip \
    && docker-php-ext-install zip pdo pdo_mysql

COPY . .

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN composer install --no-dev --optimize-autoloader


CMD sh -c "
echo 'PORTA:' \$PORT &&
php artisan config:clear &&
sleep 5 &&
php artisan migrate --force -vvv &&
php artisan serve --host=0.0.0.0 --port=\$PORT
"