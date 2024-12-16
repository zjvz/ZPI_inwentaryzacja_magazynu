const request = require('supertest');
const app = require('../app'); // Path to your express app
const moment = require('moment');
const Dzien = require('../models/Dzien');
const Straty = require('../models/Straty');
const Produkt = require('../models/Produkt');
const PolProdukt = require('../models/PolProdukt');
const { mockUser } = require('./mockUser'); // Mock user data for testing

// Mocking the database models
jest.mock('../models/Dzien');
jest.mock('../models/Straty');
jest.mock('../models/Produkt');
jest.mock('../models/PolProdukt');

describe('Wastages Controller', () => {

  beforeEach(() => {
    // Mocking the current date for consistency in tests
    jest.spyOn(moment, 'format').mockReturnValue('12/16/2024');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /data/add/:date', () => {
    it('should redirect to the correct date page', async () => {
      const res = await request(app).get('/data/add/12%2F16%2F2024');
      
      expect(res.status).toBe(302); // Redirection status code
      expect(res.header.location).toBe('/data/add/12%2F16%2F2024');
    });

    it('should render the wastages add page with data', async () => {
      const mockDzien = { name: '12/16/2024', _id: '123' };
      const mockStraty = { _id: '456', Produkty: [], ProduktyAmount: [], polProdukty: [], pPAmountJG: [], pPAmountPJ: [], pPAmountJ: [], typZatwierdzenia: 'Manager' };
      const mockProdukty = [{ _id: 'prod1' }];
      const mockPolProdukty = [{ _id: 'polProd1' }];
      
      Dzien.findOne = jest.fn().mockResolvedValue(mockDzien);
      Straty.findOne = jest.fn().mockResolvedValue(mockStraty);
      Produkt.find = jest.fn().mockResolvedValue(mockProdukty);
      PolProdukt.find = jest.fn().mockResolvedValue(mockPolProdukty);
      Straty.prototype.populate = jest.fn().mockReturnThis();

      const res = await request(app)
        .get(`/data/add/${moment().format('L')}`)
        .set('user', mockUser); // Add mock user as middleware

      expect(res.status).toBe(200); // OK status
      expect(res.text).toContain('wastages/add'); // Check for specific template rendering
    });

    it('should create a new Dzien if not found in the database', async () => {
      Dzien.findOne = jest.fn().mockResolvedValue(null);
      const mockDzienSave = jest.fn().mockResolvedValue({ name: '12/16/2024', _id: '123' });

      Dzien.prototype.save = mockDzienSave;

      await request(app)
        .get(`/data/add/${moment().format('L')}`)
        .set('user', mockUser);

      expect(Dzien.prototype.save).toHaveBeenCalled(); // Ensure save was called
    });
  });

  describe('POST /data/add', () => {
    it('should update wastages data and redirect', async () => {
      const mockStraty = { name: '12/16/2024', Produkty: [], ProduktyAmount: [], polProdukty: [], pPAmountJG: [], pPAmountPJ: [], pPAmountJ: [], save: jest.fn() };
      Straty.findOne = jest.fn().mockResolvedValue(mockStraty);

      const reqBody = {
        dateData: '12/16/2024',
        Produkty: ['prod1'],
        ProduktyAmount: [5],
        polProdukty: ['polProd1'],
        pPAmountJG: [10],
        pPAmountPJ: [15],
        pPAmountJ: [20],
      };

      const res = await request(app)
        .post('/data/add')
        .send(reqBody)
        .set('user', mockUser);

      expect(res.status).toBe(302); // Redirect status code
      expect(res.header.location).toBe(`/data/add/${encodeURIComponent('12/16/2024')}`);
      expect(mockStraty.save).toHaveBeenCalled(); // Ensure save was called
    });

    it('should handle missing straty and create a new one', async () => {
      Straty.findOne = jest.fn().mockResolvedValue(null);
      const mockStratySave = jest.fn().mockResolvedValue({ name: '12/16/2024', _id: '123' });

      Straty.prototype.save = mockStratySave;

      const reqBody = {
        dateData: '12/16/2024',
        Produkty: ['prod1'],
        ProduktyAmount: [5],
        polProdukty: ['polProd1'],
        pPAmountJG: [10],
        pPAmountPJ: [15],
        pPAmountJ: [20],
      };

      const res = await request(app)
        .post('/data/add')
        .send(reqBody)
        .set('user', mockUser);

      expect(res.status).toBe(302); // Redirect status code
      expect(res.header.location).toBe(`/data/add/${encodeURIComponent('12/16/2024')}`);
      expect(Straty.prototype.save).toHaveBeenCalled(); // Ensure save was called
    });
  });

});
