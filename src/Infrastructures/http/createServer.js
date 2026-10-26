const express = require('express');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');

const createServer = async (container) => {
  const app = express();

  // Express 4 mengisi req.body dengan objek kosong bila tidak ada payload,
  // sehingga validasi use case yang menangani payload kosong.
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      value: 'Hello world!',
    });
  });

  app.use(users(container));
  app.use(authentications(container));
  app.use(threads(container));
  app.use(comments(container));

  // route yang tidak terdaftar
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Not Found',
    });
  });

  // penanganan error terpusat
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
      res.status(400).json({
        status: 'fail',
        message: 'payload tidak valid',
      });
      return;
    }

    const translatedError = DomainErrorTranslator.translate(error);

    if (translatedError instanceof ClientError) {
      res.status(translatedError.statusCode).json({
        status: 'fail',
        message: translatedError.message,
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: 'terjadi kegagalan pada server kami',
    });
  });

  return app;
};

module.exports = createServer;
