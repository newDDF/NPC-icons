ARG NGINX_IMAGE=ghcr.io/nscaledev/docker.io/library/nginx:1.28.0-alpine

FROM ${NGINX_IMAGE}

COPY dist/ /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
