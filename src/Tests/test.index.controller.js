const { getIndex } = require('../controllers/yourController'); // Update the path to your controller
const Sprzedaz = require('../models/Sprzedaz');
const Inwentarz = require('../models/Inwentarz');
const Dostawa = require('../models/Dostawa');
const Straty = require('../models/Straty');
const mongoose = require('mongoose');

// Mock the models
jest.mock('../models/Sprzedaz');
jest.mock('../models/Inwentarz');
jest.mock('../models/Dostawa');
jest.mock('../models/Straty');

describe('Index Controller', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            user: {
                role: 'Admin' // Change this for testing different roles
            }
        };
        res = {
            render: jest.fn() // Mock the render function
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    describe('getIndex', () => {
        it('should render the Admin page with correct data when user is Admin', async () => {
            // Mock data for the database queries
            const mockSprzedaz = [{ name: 'Test Sprzedaz' }];
            const mockInwentarz = [{ name: 'Test Inwentarz' }];
            const mockDostawa = [{ name: 'Test Dostawa' }];
            const mockStraty = [{ name: 'Test Straty' }];

            // Mock the model methods
            Sprzedaz.find.mockResolvedValue(mockSprzedaz);
            Inwentarz.find.mockResolvedValue(mockInwentarz);
            Dostawa.find.mockResolvedValue(mockDostawa);
            Straty.find.mockResolvedValue(mockStraty);

            // Run the function
            await getIndex(req, res, next);

            // Check if the render method was called with the correct data
            expect(res.render).toHaveBeenCalledWith('indexes/krIndex', {
                user: req.user,
                sprzedazTA: mockSprzedaz,
                inwentarzTA: mockInwentarz,
                dostawaTA: mockDostawa,
                stratyTA: mockStraty,
            });

            // Ensure the database queries were called with the correct parameters
            expect(Sprzedaz.find).toHaveBeenCalledWith(
                { $or: [{ typZatwierdzenia: 'Manager' }, { typZatwierdzenia: 'Brak' }] },
                'name'
            );
            expect(Inwentarz.find).toHaveBeenCalledWith(
                { $or: [{ typZatwierdzenia: 'Manager' }, { typZatwierdzenia: 'Brak' }] },
                'name'
            );
            expect(Dostawa.find).toHaveBeenCalledWith(
                { $or: [{ typZatwierdzenia: 'Manager' }, { typZatwierdzenia: 'Brak' }] },
                'name'
            );
            expect(Straty.find).toHaveBeenCalledWith(
                { $or: [{ typZatwierdzenia: 'Manager' }, { typZatwierdzenia: 'Brak' }] },
                'name'
            );
        });

        it('should render the Manager page with correct data when user is Manager', async () => {
            req.user.role = 'Manager'; // Set the role to Manager

            // Mock data for the database queries
            const mockSprzedaz = [{ name: 'Test Sprzedaz' }];
            const mockInwentarz = [{ name: 'Test Inwentarz' }];
            const mockDostawa = [{ name: 'Test Dostawa' }];
            const mockStraty = [{ name: 'Test Straty' }];

            // Mock the model methods
            Sprzedaz.find.mockResolvedValue(mockSprzedaz);
            Inwentarz.find.mockResolvedValue(mockInwentarz);
            Dostawa.find.mockResolvedValue(mockDostawa);
            Straty.find.mockResolvedValue(mockStraty);

            // Run the function
            await getIndex(req, res, next);

            // Check if the render method was called with the correct data
            expect(res.render).toHaveBeenCalledWith('indexes/managerIndex', {
                user: req.user,
                sprzedazTA: mockSprzedaz,
                inwentarzTA: mockInwentarz,
                dostawaTA: mockDostawa,
                stratyTA: mockStraty,
            });

            // Ensure the database queries were called with the correct parameters for Manager
            expect(Sprzedaz.find).toHaveBeenCalledWith(
                { typZatwierdzenia: 'Brak' },
                'name'
            );
            expect(Inwentarz.find).toHaveBeenCalledWith(
                { typZatwierdzenia: 'Brak' },
                'name'
            );
            expect(Dostawa.find).toHaveBeenCalledWith(
                { typZatwierdzenia: 'Brak' },
                'name'
            );
            expect(Straty.find).toHaveBeenCalledWith(
                { typZatwierdzenia: 'Brak' },
                'name'
            );
        });
    });
});
