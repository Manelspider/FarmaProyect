FROM php:8.3-apache

RUN docker-php-ext-install pdo pdo_mysql

COPY public/ /var/www/html/
COPY shared/ /var/www/shared/
COPY config/ /var/www/config/

RUN chown -R www-data:www-data /var/www

# Configurar ServerName para silenciar la advertencia
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

EXPOSE 80
