FROM php:8.3-fpm

RUN groupadd -g 1000 php \
    && useradd --create-home --uid 1000 --gid 1000 --system  php

RUN apt-get update && apt-get install -y \
    zip\
    libpq-dev \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql \
    && pecl install -o -f redis \
    &&  rm -rf /tmp/pear \
    &&  docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
