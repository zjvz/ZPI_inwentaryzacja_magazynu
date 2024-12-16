const { expect } = require('chai');
const sinon = require('sinon');
const moment = require('moment');
const DostawaController = require('../controllers/DostawaController');
const Dostawa = require('../models/Dostawa');
const Dzien = require('../models/Dzien');
const Inwentarz = require('../models/Inwentarz');
const PolProdukt = require('../models/PolProdukt');
const { describe, it, beforeEach, afterEach } = require('mocha');

// Mocking the models
describe('DostawaController', () => {
  let req, res, next;

  beforeEach(() => {
    // Creating mock request, response and next functions
    req = { params: {}, body: {}, user: { role: 'Manager' } };
    res = { render: sinon.spy(), send: sinon.spy(), redirect: sinon.spy() };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getSupplyPageDate', () => {
    it('should redirect to supply info page based on first dostawa name', async () => {
      // Mocking Dostawa.find()
      const mockDostawy = [{ name: '2023-12-15' }];
      sinon.stub(Dostawa, 'find').returns(mockDostawy);
      
      await DostawaController.getSupplyPageDate(req, res, next);
      
      expect(res.redirect.calledOnceWith('/supply/info/2023-12-15')).to.be.true;
    });
  });

  describe('getSupplyPage', () => {
    it('should render the supply page with the correct data', async () => {
      // Mocking Dostawa.find() and populate
      const mockDostawy = [{ name: '2023-12-15' }];
      const mockDostawa = {
        polProdukty: [
          { name: 'Product 1', unitMain: 'kg' },
          { name: 'Product 2', unitMain: 'liters' }
        ],
        pPAmountJG: [10, 20],
      };
      sinon.stub(Dostawa, 'find').returns(mockDostawy);
      sinon.stub(Dostawa, 'findOne').returns(mockDostawa);
      
      await DostawaController.getSupplyPage(req, res, next);
      
      expect(res.render.calledOnceWith('supply/index', {
        user: req.user,
        dostawa: mockDostawa,
        dostawy: mockDostawy,
        table: [
          { name: 'Product 1', unitMain: 'kg', amount: 10 },
          { name: 'Product 2', unitMain: 'liters', amount: 20 }
        ]
      })).to.be.true;
    });
  });

  describe('postSupplyApi', () => {
    it('should send supply data with estimated amounts', async () => {
      const mockDzien = [
        { polProdukty: [{ _id: '1', name: 'Product 1', multiplayerSubToMain: 1, multiplayerUnitToSub: 1 }], usageAmount: [5] },
        { polProdukty: [{ _id: '2', name: 'Product 2', multiplayerSubToMain: 2, multiplayerUnitToSub: 2 }], usageAmount: [10] }
      ];
      const mockInwentarz = {
        polProdukty: [
          { _id: '1', name: 'Product 1', unitMain: 'kg', multiplayerSubToMain: 1, multiplayerUnitToSub: 1, pPAmountJG: [100], pPAmountPJ: [200], pPAmountJ: [300] },
          { _id: '2', name: 'Product 2', unitMain: 'liters', multiplayerSubToMain: 2, multiplayerUnitToSub: 2, pPAmountJG: [50], pPAmountPJ: [100], pPAmountJ: [150] }
        ]
      };
      sinon.stub(Dzien, 'find').returns(mockDzien);
      sinon.stub(Inwentarz, 'findOne').returns(mockInwentarz);

      req.body = { daysAmount: 5, overageAmount: 10 };

      await DostawaController.postSupplyApi(req, res, next);

      expect(res.send.calledOnceWith(sinon.match.object)).to.be.true;
    });
  });

  describe('postSupplyApiEdit', () => {
    it('should save the supply data and send the correct response', async () => {
      const mockDostawa = {
        name: '2023-12-16',
        save: sinon.stub().returnsThis(),
        typZatwierdzenia: 'Manager',
      };
      req.body = {
        daysAmount: 5,
        overageAmount: 10,
        table: [{ _id: '1', estimatedAmount: 10 }]
      };
      
      sinon.stub(Dostawa.prototype, 'save').returns(mockDostawa);

      await DostawaController.postSupplyApiEdit(req, res, next);

      expect(res.send.calledOnceWith(sinon.match.object)).to.be.true;
      expect(mockDostawa.typZatwierdzenia).to.equal('Manager');
    });
  });

  describe('getSupplyPagePost', () => {
    it('should save the dostawa with correct typZatwierdzenia based on user role', async () => {
      const mockDostawa = {
        name: '2023-12-15',
        save: sinon.stub().returnsThis(),
        typZatwierdzenia: 'Manager',
      };
      
      sinon.stub(Dostawa, 'findOne').returns(mockDostawa);

      await DostawaController.getSupplyPagePost(req, res, next);

      expect(mockDostawa.typZatwierdzenia).to.equal('Manager');
      expect(res.send.calledOnceWith(sinon.match.object)).to.be.true;
    });
  });
});
