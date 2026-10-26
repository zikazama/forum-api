require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

(async () => {
  const app = await createServer(container);
  const host = process.env.HOST;
  const port = process.env.PORT || 5000;

  app.listen(port, host, () => {
    console.log(`server start at http://${host || 'localhost'}:${port}`);
  });
})();
