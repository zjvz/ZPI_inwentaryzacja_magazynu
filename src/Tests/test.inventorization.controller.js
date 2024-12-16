const moment = require('moment');
const mockingoose = require('mockingoose');
const { getAddInvDatePage, getAddInvPage, postAddInv } = require('../path_to_your_controller');
const Dzien = require('../models/Dzien');
const Inwentarz = require('../models/Inwentarz');
const PolProdukt = require('../models/PolProdukt');
const { ObjectId } = require('mongoose').Types;

jest.mock('moment', () => () => ({
  format: jest.fn().mockReturnValue('12/16/2024'), // Mock current date
}));

describe('Controller Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAddInvDatePage', () => {
    it('should redirect to the correct URL with the current date', async () => {
      const req = {};
      const res = {
        redirect: jest.fn(),
      };
      await getAddInvDatePage(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/storages/inv/add/12%2F16%2F2024');
    });
  });

  describe('getAddInvPage', () => {
    it('should render the add status page with correct data', async () => {
      const req = { params: { date: '12/16/2024' }, user: { role: 'Manager' } };
      const res = { render: jest.fn() };

      // Mocking models
      mockingoose(Dzien).toReturn({ name: '12/16/2024' }, 'findOne');
      mockingoose(Inwentarz).toReturn({ name: '12/16/2024', polProdukty: [] }, 'findOne');
      mockingoose(PolProdukt).toReturn([], 'find');

      await getAddInvPage(req, res);
      
      expect(res.render).toHaveBeenCalledWith('storages/addStatus', expect.objectContaining({
        user: req.user,
        date: expect.any(Object),
        dni: expect.any(Array),
        inv: expect.any(Object),
      }));
    });
  });

  describe('postAddInv', () => {
    it('should update the inventory and redirect with a success message', async () => {
      const req = {
        body: {
          dateData: '12/16/2024',
          polProdukty: ['product1', 'product2'],
          pPAmountJG: [10, 20],
          pPAmountPJ: [30, 40],
          pPAmountJ: [50, 60],
        },
        user: { role: 'Manager' },
        flash: jest.fn(),
      };
      const res = { redirect: jest.fn() };

      // Mocking models
      mockingoose(Inwentarz).toReturn(
        { name: '12/16/2024', polProdukty: [], pPAmountJG: [], pPAmountPJ: [], pPAmountJ: [], typZatwierdzenia: 'Kierownik Restauracji' },
        'findOne'
      );

      await postAddInv(req, res);

      // Verify the updated inventory
      expect(res.redirect).toHaveBeenCalledWith('/storages/inv/add/12%2F16%2F2024');
      expect(req.flash).toHaveBeenCalledWith('success_msg', 'Prawidłowo zaktualizowano dane inwentaryzacji');
    });
  });
});
