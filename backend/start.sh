#!/bin/sh
#!/bin/sh

echo "🔥 SCRIPT INICIOU 🔥"

echo "🧹 Limpando cache..."
php artisan config:clear
php artisan cache:clear

echo "⏳ Aguardando banco..."

until php -r "
try {
    new PDO(
        'mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE'),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD')
    );
    echo 'Banco conectado!\n';
} catch (Exception \$e) {
    exit(1);
}
"; do
  echo "❌ Banco ainda não está pronto... tentando novamente"
  sleep 2
done

echo "🚀 Rodando migrations..."
php artisan migrate --force -vvv || echo "💀 ERRO NA MIGRATION"

echo "🌐 Iniciando servidor..."
php artisan serve --host=0.0.0.0 --port=$PORT