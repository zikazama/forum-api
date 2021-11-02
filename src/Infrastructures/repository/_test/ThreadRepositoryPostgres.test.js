const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Available thread and comment function', () => {
    it('should get thread not found', async () => {
      // Arrange

      const registerUser = new RegisterUser({
        username: 'zikazama',
        password: '123',
        fullname: 'Fauzi',
      });

      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-234',
      });

      const fakeIdGeneratorThread = () => '123'; // stub!
      const fakeIdGeneratorUser = () => '234'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGeneratorThread);
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGeneratorUser);

      // Action & Assert
      await expect(threadRepositoryPostgres.getThread({ threadId: 'thread-123' })).rejects.toThrowError(NotFoundError);
    });
    it('should get thread', async () => {
      // Arrange

      const registerUser = new RegisterUser({
        username: 'zikazama',
        password: '123',
        fullname: 'Fauzi',
      });

      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-234',
      });

      const fakeIdGeneratorThread = () => '123'; // stub!
      const fakeIdGeneratorUser = () => '234'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGeneratorThread);
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGeneratorUser);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(addThread);

      // Action & Assert
      await expect(threadRepositoryPostgres.getThread({ threadId: 'thread-123' })).resolves.not.toThrowError(NotFoundError);
      expect(await threadRepositoryPostgres.getThread({ threadId: 'thread-123' })).not.toBeNull();
    });
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange

      const registerUser = new RegisterUser({
        username: 'zikazama',
        password: '234',
        fullname: 'Fauzi',
      });

      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-234',
      });
      const fakeIdGeneratorThread = () => '123'; // stub!
      const fakeIdGeneratorUser = () => '234'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGeneratorThread);
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGeneratorUser);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(addThread);

      // Assert
      const threads = await ThreadsTableTestHelper.getDetailThread('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'zikazama',
        password: '234',
        fullname: 'Fauzi',
      });

      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-234',
      });
      const fakeIdGeneratorThread = () => '123'; // stub!
      const fakeIdGeneratorUser = () => '234'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGeneratorThread);
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGeneratorUser);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      const addedThread = await threadRepositoryPostgres.addThread(addThread);

      // Assert
      expect(addedThread).toStrictEqual({
        id: 'thread-123',
        title: 'judul',
        body: 'isi',
        owner: 'user-234',
      });
    });
  });
});
