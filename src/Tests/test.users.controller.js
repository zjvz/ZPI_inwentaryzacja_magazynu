const request = require('supertest');
const app = require('../app'); // Assuming your app is exported from this file
const bcrypt = require('bcryptjs');
const Pracownik = require('../models/Pracownik');
const { getUsersPage, getAddUser, postAddUser, postUsersApi } = require('../controllers/usersController');

// Mocking models and bcrypt
jest.mock('../models/Pracownik');
jest.mock('bcryptjs');

describe('Users Controller Tests', () => {
  let mockPracownik;

  beforeEach(() => {
    // Mocking the Pracownik model
    mockPracownik = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOneAndRemove: jest.fn(),
      save: jest.fn(),
    };
    Pracownik.find.mockClear();
    Pracownik.findOne.mockClear();
    Pracownik.findOneAndUpdate.mockClear();
    Pracownik.findOneAndRemove.mockClear();
    Pracownik.save.mockClear();
    bcrypt.genSalt.mockClear();
    bcrypt.hash.mockClear();
  });

  test('GET /users should render users page with data', async () => {
    const mockUsers = [{ _id: '123', fName: 'John', lName: 'Doe', role: 'Admin', password: 'password' }];
    Pracownik.find.mockResolvedValue(mockUsers);
    
    const res = await request(app).get('/users');

    expect(res.status).toBe(200);
    expect(res.text).toContain('users/index');
    expect(Pracownik.find).toHaveBeenCalled();
  });

  test('GET /users/add should render add user page', async () => {
    const res = await request(app).get('/users/add');

    expect(res.status).toBe(200);
    expect(res.text).toContain('users/addUser');
  });

  test('POST /users/add should add a new user successfully', async () => {
    const mockUser = {
      fName: 'John',
      lName: 'Doe',
      role: 'Manager',
      login: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      address: '1234 Main St'
    };

    Pracownik.findOne.mockResolvedValue(null); // Ensure the user doesn't already exist
    bcrypt.hash.mockResolvedValue('hashedpassword'); // Mock bcrypt hash

    const res = await request(app)
      .post('/users/add')
      .send(mockUser);

    expect(res.status).toBe(302); // Expecting a redirect
    expect(res.headers.location).toBe('/users');
    expect(Pracownik.findOne).toHaveBeenCalledWith({ login: mockUser.login });
    expect(Pracownik.prototype.save).toHaveBeenCalled();
  });

  test('POST /users/add should return error if user exists', async () => {
    const mockUser = {
      fName: 'John',
      lName: 'Doe',
      role: 'Manager',
      login: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      address: '1234 Main St'
    };

    Pracownik.findOne.mockResolvedValue(mockUser); // Simulate user already exists

    const res = await request(app)
      .post('/users/add')
      .send(mockUser);

    expect(res.status).toBe(200);
    expect(res.text).toContain('Użytkownik o takim loginie już istnieje');
  });

  test('POST /users/edit should update user details', async () => {
    const mockUser = {
      prevLogin: 'johndoe',
      fName: 'John',
      lName: 'Doe',
      role: 'Manager',
      login: 'johnnydoe',
      email: 'johnny@example.com',
      address: '1234 Main St',
      type: 'edit'
    };

    const updatedUser = { ...mockUser, login: 'johnnydoe' };
    Pracownik.findOneAndUpdate.mockResolvedValue(updatedUser); // Mock the successful update

    const res = await request(app)
      .post('/users')
      .send(mockUser);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/users');
    expect(Pracownik.findOneAndUpdate).toHaveBeenCalledWith({ login: 'johndoe' }, updatedUser, { new: true });
  });

  test('POST /users/remove should delete user successfully', async () => {
    const mockUser = {
      prevLogin: 'johndoe',
      type: 'remove'
    };

    Pracownik.findOneAndRemove.mockResolvedValue({ login: 'johndoe' }); // Simulate successful removal

    const res = await request(app)
      .post('/users')
      .send(mockUser);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/users');
    expect(Pracownik.findOneAndRemove).toHaveBeenCalledWith({ login: 'johndoe' });
  });

  test('GET /users/api should return a list of users in JSON format', async () => {
    const mockUsers = [{ _id: '123', fName: 'John', lName: 'Doe', role: 'Admin', password: 'password' }];
    Pracownik.find.mockResolvedValue(mockUsers);

    const res = await request(app).get('/users/api');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(JSON.stringify(mockUsers));
    expect(Pracownik.find).toHaveBeenCalled();
  });
});
