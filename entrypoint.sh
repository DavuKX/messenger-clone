#!/bin/sh

# Run the Laravel Echo Server
php artisan reverb:start &

# Start PHP-FPM
php-fpm
