const request = require('supertest');
const app = require('../app');  // Assuming your Express app is exported here
const Magazyn = require('../models/Magazyn');
const PolProdukt = require('../models/PolProdukt');
const Produkt = require('../models/Produkt');

// Mocking the models
jest.mock('../models/Magazyn');
jest.mock('../models/PolProdukt');
jest.mock('../models/Produkt');

describe('SPProduct Controller', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test for GET /spproducts page
    describe('GET /spproducts', () => {
        it('should render the SPProducts page with storages', async () => {
            const mockMagazyny = [{ name: 'Magazyn 1', shortcut: 'M1' }, { name: 'Magazyn 2', shortcut: 'M2' }];
            Magazyn.find.mockResolvedValue(mockMagazyny);

            const response = await request(app).get('/spproducts');
            expect(response.status).toBe(200);
            expect(response.text).toContain('Magazyn 1');
            expect(response.text).toContain('Magazyn 2');
        });
    });

    // Test for GET /spproducts API
    describe('GET /api/spproducts', () => {
        it('should return list of SPProducts', async () => {
            const mockPolProdukty = [{ name: 'PolProdukt 1' }, { name: 'PolProdukt 2' }];
            PolProdukt.find.mockResolvedValue(mockPolProdukty);

            const response = await request(app).get('/api/spproducts');
            expect(response.status).toBe(200);
            expect(JSON.parse(response.text)).toEqual(mockPolProdukty);
        });
    });

    // Test for GET Add SPProduct page
    describe('GET /spproducts/add', () => {
        it('should render the Add SPProduct page with storages', async () => {
            const mockMagazyny = [{ name: 'Magazyn 1', shortcut: 'M1' }];
            Magazyn.find.mockResolvedValue(mockMagazyny);

            const response = await request(app).get('/spproducts/add');
            expect(response.status).toBe(200);
            expect(response.text).toContain('Magazyn 1');
        });
    });

    // Test for POST Add SPProduct
    describe('POST /spproducts/add', () => {
        it('should add a new SPProduct', async () => {
            const newProduct = { 
                name: 'New Product', 
                storage: 'M1', 
                unitMain: 'kg', 
                unitSub: 'g', 
                unit: 'kg/g', 
                multiplayerSubToMain: 1000, 
                multiplayerUnitToSub: 1 
            };

            const mockMagazyn = { _id: 'M1', name: 'Magazyn 1' };
            Magazyn.findOne.mockResolvedValue(mockMagazyn);

            PolProdukt.findOne.mockResolvedValue(null); // No product with the same name

            PolProdukt.prototype.save.mockResolvedValue(newProduct);

            const response = await request(app).post('/spproducts/add').send(newProduct);
            expect(response.status).toBe(302); // Redirect after successful add
            expect(response.headers.location).toBe('/spproducts');
        });

        it('should return error if fields are missing', async () => {
            const incompleteProduct = { name: 'New Product' }; // Missing required fields

            const response = await request(app).post('/spproducts/add').send(incompleteProduct);
            expect(response.status).toBe(200); // Should render with error message
            expect(response.text).toContain('Uzupełnij wszystkie pola!');
        });
    });

    // Test for POST Edit SPProduct
    describe('POST /spproducts/edit', () => {
        it('should edit an existing SPProduct', async () => {
            const updatedProduct = {
                prevName: 'Old Product',
                name: 'Updated Product',
                storage: 'M1',
                unitMain: 'kg',
                unitSub: 'g',
                unit: 'kg/g',
                multiplayerSubToMain: 1000,
                multiplayerUnitToSub: 1,
                type: 'edit'
            };

            const mockMagazyn = { _id: 'M1', name: 'Magazyn 1' };
            const mockPolProdukt = { _id: 'p1', name: 'Old Product' };
            Magazyn.findOne.mockResolvedValue(mockMagazyn);
            PolProdukt.findOne.mockResolvedValue(mockPolProdukt);

            PolProdukt.prototype.save.mockResolvedValue(updatedProduct);

            const response = await request(app).post('/spproducts/edit').send(updatedProduct);
            expect(response.status).toBe(302); // Redirect after successful update
            expect(response.headers.location).toBe('/spproducts');
        });
    });

    // Test for POST remove SPProduct
    describe('POST /spproducts/remove', () => {
        it('should remove an SPProduct and update related products', async () => {
            const productToRemove = { prevName: 'Product to Remove', type: 'remove' };
            const mockProduct = { _id: 'p1', name: 'Product to Remove' };

            PolProdukt.findOneAndRemove.mockResolvedValue(mockProduct);

            const response = await request(app).post('/spproducts/remove').send(productToRemove);
            expect(response.status).toBe(302); // Redirect after successful removal
            expect(response.headers.location).toBe('/spproducts');
        });
    });

    // Test for refreshProducts function
    describe('refreshProducts', () => {
        it('should update the products and remove the SPProduct from the product list', async () => {
            const SPProduct_id = 'SP123';
            const mockProdukty = [
                {
                    _id: 'prod1',
                    polProdukty: [{ _id: 'SP123' }],
                    amount: [10],
                    save: jest.fn()
                }
            ];
            Produkt.find.mockResolvedValue(mockProdukty);

            await refreshProducts(SPProduct_id);

            expect(mockProdukty[0].save).toHaveBeenCalled();
            expect(mockProdukty[0].polProdukty).toHaveLength(0);
            expect(mockProdukty[0].amount).toHaveLength(0);
        });
    });

});
