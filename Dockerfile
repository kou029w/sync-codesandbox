FROM kou029w/puppeteer-node:latest
USER root
RUN npm --unsafe-perm=true install -g kou029w/sync-codesandbox
USER pptruser
ENTRYPOINT ["sync-codesandbox"]
