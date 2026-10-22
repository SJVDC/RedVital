# syntax=docker/dockerfile:1.7
# Aplicación web de RedVital: build de Vite servido por Caddy sin root.
# Corre en la VM de borde detrás del Caddy de borde, que termina TLS, pone
# las cabeceras de seguridad y envía /api/* a APISIX. Este contenedor solo
# sirve archivos estáticos.

FROM node:24-alpine AS construccion
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM caddy:2-alpine
# El binario oficial trae cap_net_bind_service como capacidad de archivo; con
# cap_drop: ALL el kernel se niega a ejecutarlo. Escucha en 8080: no la necesita.
RUN apk add --no-cache libcap \
 && setcap -r /usr/bin/caddy \
 && apk del libcap \
 && addgroup -S -g 10001 web && adduser -S -u 10001 -G web web \
 && mkdir -p /data /config && chown -R web:web /data /config
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=construccion /app/dist /srv
USER web
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/salud || exit 1
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
