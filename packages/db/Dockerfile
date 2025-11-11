FROM postgres:17-bookworm

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    postgis \
    postgresql-17-postgis-3 \
    postgresql-17-postgis-3-scripts; \
    rm -rf /var/lib/apt/lists/*

EXPOSE 5432

COPY docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/

