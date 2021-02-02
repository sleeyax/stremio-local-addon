FROM stremio-js-image

ENV ENGINE_URL=

COPY package*.json ./

RUN npm install --production && npm cache clean --force

COPY bin/ bin/
COPY lib/ lib/
COPY index.js index.js

CMD [ "npm", "start" ]