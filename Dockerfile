FROM docker.io/library/nginx:1.27-alpine

RUN rm -f /etc/nginx/conf.d/default.conf \
    && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx site/ /usr/share/nginx/html/

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
