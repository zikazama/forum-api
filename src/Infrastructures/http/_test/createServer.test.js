const request = require('supertest');
const createServer = require('../createServer');

describe('HTTP server', () => {
  it('should response 200 when request root route', async () => {
    // Arrange
    const app = await createServer({});

    // Action
    const response = await request(app).get('/');

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body.value).toEqual('Hello world!');
  });

  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const app = await createServer({});

    // Action
    const response = await request(app).get('/unregisteredRoute');

    // Assert
    expect(response.status).toEqual(404);
  });

  it('should response 400 when request payload is not valid json', async () => {
    // Arrange
    const app = await createServer({});

    // Action
    const response = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send('{"username": ');

    // Assert
    expect(response.status).toEqual(400);
    expect(response.body.status).toEqual('fail');
    expect(response.body.message).toEqual('payload tidak valid');
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const app = await createServer({}); // fake injection

    // Action
    const response = await request(app).post('/users').send(requestPayload);

    // Assert
    expect(response.status).toEqual(500);
    expect(response.body.status).toEqual('error');
    expect(response.body.message).toEqual('terjadi kegagalan pada server kami');
  });
});
