# ベースイメージとしてPHPのApacheイメージを使用
FROM php:8.1-apache

# 作業ディレクトリを設定
WORKDIR /var/www/html

# プロジェクトのソースコードをコンテナにコピー
COPY ./src/ /var/www/html/

# 必要に応じて追加のPHP拡張をインストール
# RUN docker-php-ext-install pdo pdo_mysql

# ポート80を公開
EXPOSE 80
