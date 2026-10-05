# Base stage - common dependencies
FROM php:8.5.7-fpm AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    nginx \
    supervisor \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Fix NGINX and other vulnerabilities
# Update package sources and explicitly update nginx to the patched version
RUN apt-get update && \
    apt-get install -y --only-upgrade nginx || apt-get install -y --no-install-recommends nginx && \
    rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get upgrade -y openssl \
    && rm -rf /var/lib/apt/lists/*
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip calendar

# Set working directory
WORKDIR /var/www/html

# Vendor stage - install dependencies
FROM base AS vendor

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy dependency files
COPY composer.json composer.lock ./

# Install PHP dependencies (production optimized)
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --no-interaction \
    --prefer-dist \
    && composer clear-cache

# Node stage - build frontend assets
FROM node:20-alpine AS node

WORKDIR /var/www/html

# Copy package files
COPY package*.json ./

# Install node dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source files needed for build
COPY resources ./resources
COPY public ./public
COPY vite.config.ts tsconfig.json components.json ./

# Copy TinyMCE to public directory
RUN cp -r node_modules/tinymce public/

# Wayfinder generation stage - requires both PHP and Node
FROM base AS wayfinder

WORKDIR /var/www/html

# Install Node.js in the PHP image
# --- Change this in your "wayfinder" stage ---
# Install Node.js using the modern NodeSource repository method
RUN apt-get update && apt-get install -y ca-certificates curl gnupg \
    && mkdir -p /usr/share/keyrings \
    && curl -fsSL https://nodesource.com | gpg --dearmor -o /usr/share/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://nodesource.com nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy vendor from vendor stage
COPY --from=vendor /var/www/html/vendor ./vendor

# Copy application code
COPY . .

# Get Composer to generate autoloader
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer dump-autoload --optimize \
    && rm /usr/bin/composer

# Copy node_modules from node stage
COPY --from=node /var/www/html/node_modules ./node_modules

# Generate wayfinder routes
RUN php artisan wayfinder:generate --with-form

# Final node build stage
FROM node AS node-build

# Copy generated routes from wayfinder stage
COPY --from=wayfinder /var/www/html/resources/js/routes ./resources/js/routes

# Build production assets (skip wayfinder plugin since routes already generated)
ENV SKIP_WAYFINDER=true
RUN npm run build

# App stage - final production image
FROM base AS app

# Copy vendor from vendor stage
COPY --from=vendor /var/www/html/vendor ./vendor

# Copy application code
COPY --chown=www-data:www-data . /var/www/html

# Copy built frontend assets and TinyMCE from node-build stage
COPY --from=node-build --chown=www-data:www-data /var/www/html/public/build ./public/build
COPY --from=node-build --chown=www-data:www-data /var/www/html/public/tinymce ./public/tinymce

# Generate optimized autoloader
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer dump-autoload --optimize --classmap-authoritative \
    && rm /usr/bin/composer

# Copy configuration files
COPY docker/nginx/default.conf /etc/nginx/sites-available/default
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set permissions for Laravel directories
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create necessary directories
RUN mkdir -p /var/log/supervisor

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/api/health || exit 1

# Switch to non-root user
USER www-data

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
