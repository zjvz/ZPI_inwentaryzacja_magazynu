const { getStatsDatePage, getStatsPage } = require('../controllers/statsController');
const moment = require('moment');
const Dzien = require('../models/Dzien');
const Straty = require('../models/Straty');
const Produkt = require('../models/Produkt');
const PolProdukt = require('../models/PolProdukt');
const Inwentarz = require('../models/Inwentarz');
const Dostawa = require('../models/Dostawa');
const mongoose = require('mongoose');

// Mock mongoose models
jest.mock('../models/Dzien');
jest.mock('../models/Straty');
jest.mock('../models/Produkt');
jest.mock('../models/PolProdukt');
jest.mock('../models/Inwentarz');
jest.mock('../models/Dostawa');

describe('Stats Controller', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('getStatsDatePage', () => {
    it('should redirect to the correct date', async () => {
      const res = { redirect: jest.fn() };
      const req = {}; // Empty request as no parameters are required

      await getStatsDatePage(req, res);

      // Verify that redirect is called with the previous day's date
      const todayDate = moment().subtract(1, 'days').format('L');
      expect(res.redirect).toHaveBeenCalledWith(`/data/info/${encodeURIComponent(todayDate)}`);
    });
  });

  describe('getStatsPage', () => {
    it('should render the stats page with correct data', async () => {
      const res = { render: jest.fn() };
      const req = { params: { date: moment().format('L') } };

      // Mocks for models
      const mockedDzien = {
        name: moment().format('L'),
        save: jest.fn(),
        inwentarz: { polProdukty: [], pPAmountJG: [], pPAmountPJ: [], pPAmountJ: [] },
        sprzedaz: { Produkty: [], ProduktyAmount: [] },
        straty: { Produkty: [], ProduktyAmount: [], polProdukty: [], pPAmountJG: [], pPAmountPJ: [], pPAmountJ: [] }
      };
      const mockedInwentarz = { pPAmountJG: [], pPAmountPJ: [], pPAmountJ: [] };
      const mockedProdukt = [{ _id: mongoose.Types.ObjectId(), polProdukty: [], amount: [] }];
      const mockedPolProdukt = [{ _id: mongoose.Types.ObjectId(), name: 'Test Product', unitMain: 'kg', unitSub: 'g', unit: 'g', multiplayerSubToMain: 10, multiplayerUnitToSub: 100 }];
      const mockedDostawa = { polProdukty: [{ _id: mongoose.Types.ObjectId() }], pPAmountJG: [5] };

      Dzien.findOne.mockResolvedValue(mockedDzien);
      Dzien.find.mockResolvedValue([mockedDzien]); // For dni
      Inwentarz.findOne.mockResolvedValue(mockedInwentarz);
      Produkt.find.mockResolvedValue(mockedProdukt);
      PolProdukt.find.mockResolvedValue(mockedPolProdukt);
      Dostawa.findOne.mockResolvedValue(mockedDostawa);

      await getStatsPage(req, res);

      // Check that the render function was called with the correct data
      expect(res.render).toHaveBeenCalledWith('data/index', expect.objectContaining({
        user: req.user, 
        date: mockedDzien, 
        dni: [mockedDzien], 
        produkty: mockedProdukt, 
        polprodukty: mockedPolProdukt, 
        nextDateInv: mockedInwentarz, 
        tableData: expect.any(Array)
      }));
    });
  });

  describe('sprzedazPolProduktu', () => {
    it('should calculate total sales for the product', () => {
      const _id = mongoose.Types.ObjectId();
      const _produkty = [
        {
          _id,
          polProdukty: [{ _id, amount: [2] }],
        },
      ];
      const _date = {
        sprzedaz: { Produkty: [_id], ProduktyAmount: [5] },
      };

      const result = sprzedazPolProduktu(_id, _produkty, _date);
      
      expect(result).toBe(10); // 2 * 5 = 10
    });
  });

  describe('stratyPolProduktu', () => {
    it('should calculate total losses for the product', () => {
      const _id = mongoose.Types.ObjectId();
      const multiplayerSubToMain = 10;
      const multiplayerUnitToSub = 100;
      const _produkty = [
        {
          _id,
          polProdukty: [{ _id, amount: [2] }],
        },
      ];
      const _date = {
        straty: {
          Produkty: [_id],
          ProduktyAmount: [5],
          polProdukty: [_id],
          pPAmountJG: [1],
          pPAmountPJ: [2],
          pPAmountJ: [3],
        },
      };

      const result = stratyPolProduktu(_id, multiplayerSubToMain, multiplayerUnitToSub, _produkty, _date);
      
      expect(result).toBe(106); // 2 * 5 + ((1 * 10) * 100) + (2 * 100) + 3 = 106
    });
  });
});
