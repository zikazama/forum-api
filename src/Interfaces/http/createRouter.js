const express = require('express');

// Express 4 tidak menangkap error dari handler async secara otomatis,
// sehingga setiap handler dibungkus agar error diteruskan ke penanganan error terpusat.
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const createRouter = (routes) => {
  const router = express.Router();

  routes.forEach(({ method, path, handler }) => {
    router[method.toLowerCase()](path, asyncHandler(handler));
  });

  return router;
};

module.exports = createRouter;
