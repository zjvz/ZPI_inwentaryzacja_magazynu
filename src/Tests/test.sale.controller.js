const request = require('supertest');
const app = require('../app'); // Assuming your Express app is exported from this file
const moment = require('moment');
const Dzien = require('../models/Dzien');
const Straty = require('../models/Straty');
const Produkt = require('../models/Produkt');
const PolProdukt = require('../models/PolProdukt');
const Sprzedaz = require('../models/Sprzedaz');

jest.mock('../models/Dzien');
jest.mock('../models/Sprzedaz');
jest.mock('../models/Produkt');

// Test data setup
const mockUser = {
    role: 'Manager', 
    _id: 'mockUserId'
};

const mockDate = moment().format('L');
const mockRequest = {
    user: mockUser,
    params: { date: mockDate }
};

describe('Sale Controller Tests', () => {
    let mockDzien;
    let mockSprzedaz;

    beforeEach(() => {
        mockDzien = {
            name: mockDate,
            sprzedaz: 'mockSprzedazId',
            save: jest.fn(),
        };

        mockSprzedaz = {
            _id: 'mockSprzedazId',
            name: mockDate,
            Produkty: [],
            ProduktyAmount: [],
            typZatwierdzenia: 'Manager',
            save: jest.fn(),
            populate: jest.fn(() => mockSprzedaz),
        };

        Dzien.findOne = jest.fn().mockResolvedValue(mockDzien);
        Sprzedaz.findOne = jest.fn().mockResolvedValue(mockSprzedaz);
        Produkt.find = jest.fn().mockResolvedValue([{ _id: 'mockProduktId' }]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GET /sale/add redirects to current sale page', async () => {
        const res = await request(app)
            .get('/sale/add')
            .set('Cookie', [`userId=${mockUser._id}`]);

        expect(res.status).toBe(302); // redirects
        expect(res.headers.location).toBe(`/sale/add/${encodeURIComponent(mockDate)}`);
    });

    test('GET /sale/add/:date should render sale add page correctly', async () => {
        const res = await request(app)
            .get(`/sale/add/${encodeURIComponent(mockDate)}`)
            .set('Cookie', [`userId=${mockUser._id}`]);

        expect(res.status).toBe(200); // OK response
        expect(res.text).toContain('sale/add');
        expect(Dzien.findOne).toHaveBeenCalledWith({ name: mockDate });
        expect(Sprzedaz.findOne).toHaveBeenCalledWith({ name: mockDate });
        expect(Produkt.find).toHaveBeenCalled();
    });

    test('POST /sale/add should update sale data and redirect', async () => {
        const mockBody = {
            dateData: mockDate,
            Produkty: ['mockProduktId'],
            ProduktyAmount: [10],
        };

        Sprzedaz.findOne = jest.fn().mockResolvedValue(mockSprzedaz);
        mockSprzedaz.save = jest.fn().mockResolvedValue(mockSprzedaz);

        const res = await request(app)
            .post('/sale/add')
            .send(mockBody)
            .set('Cookie', [`userId=${mockUser._id}`]);

        expect(res.status).toBe(302); // redirects
        expect(res.headers.location).toBe(`/sale/add/${encodeURIComponent(mockDate)}`);
        expect(Sprzedaz.findOne).toHaveBeenCalledWith({ name: mockDate });
        expect(mockSprzedaz.save).toHaveBeenCalled();
        expect(req.flash).toHaveBeenCalledWith('success_msg', 'Prawidłowo zaktualizowano dane sprzedaży');
    });
});
