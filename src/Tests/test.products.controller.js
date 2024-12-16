const request = require('supertest');
const app = require('../app');  // Assuming your Express app is in 'app.js'
const { Produkt, PolProdukt } = require('../models');  // Import models
jest.mock('../models/Produkt.js');  // Mock the Produkt model
jest.mock('../models/PolProdukt.js');  // Mock the PolProdukt model

describe('Products Controller Tests', () => {

    // Helper function to mock logged-in user
    const mockUser = (role = 'Admin') => ({
        user: {
            role,
            _id: 'user123',
            name: 'Test User',
        }
    });

    describe('GET /products', () => {
        it('should render the products page with products', async () => {
            // Mock the find and populate behavior
            const mockProducts = [
                { name: 'Product1', price: 100, isDisabled: false },
                { name: 'Product2', price: 200, isDisabled: true }
            ];
            Produkt.find.mockResolvedValue(mockProducts);

            const res = await request(app)
                .get('/products')
                .set(mockUser('Admin'));  // Set mock user as 'Admin'

            expect(res.status).toBe(200);
            expect(res.text).toContain('Product1');  // Check if 'Product1' is in the response
            expect(res.text).toContain('Product2');  // Check if 'Product2' is in the response
        });
    });

    describe('GET /products/add', () => {
        it('should render the add product page', async () => {
            const mockPolProdukty = [{ name: 'PolProduct1' }];
            PolProdukt.find.mockResolvedValue(mockPolProdukty);

            const res = await request(app)
                .get('/products/add')
                .set(mockUser('Admin'));

            expect(res.status).toBe(200);
            expect(res.text).toContain('PolProduct1');
        });
    });

    describe('POST /products/add', () => {
        it('should add a new product and redirect', async () => {
            const newProduct = {
                name: 'New Product',
                price: 150,
                disabled: false,
                _ids: ['id1'],
                amount: [10]
            };

            // Mock PolProdukt.find to return mock data
            PolProdukt.find.mockResolvedValue([{ _id: 'id1', name: 'PolProduct1' }]);

            // Mock Produkt.create to resolve successfully
            Produkt.create.mockResolvedValue(newProduct);

            const res = await request(app)
                .post('/products/add')
                .send(newProduct)
                .set(mockUser('Admin'));

            expect(res.status).toBe(302);  // Redirection status code
            expect(res.header.location).toBe('/products');  // Check if redirected to '/products'
            expect(res.flash.success_msg).toBe(`Prawidłowo dodano Produkt ${newProduct.name}`);
        });

        it('should handle missing fields and return errors', async () => {
            const invalidProduct = {
                name: '',
                price: '',
                _ids: [],
                amount: []
            };

            const res = await request(app)
                .post('/products/add')
                .send(invalidProduct)
                .set(mockUser('Admin'));

            expect(res.status).toBe(200);
            expect(res.text).toContain('Dodaj przynajmniej jeden Pół-Produkt!');
            expect(res.text).toContain('Uzupełnij wszystkie pola!');
        });
    });

    describe('GET /products/edit/:name', () => {
        it('should render the edit page for a product', async () => {
            const mockProduct = { name: 'Product1', price: 100, isDisabled: false, polProdukty: [] };
            Produkt.findOne.mockResolvedValue(mockProduct);

            const res = await request(app)
                .get('/products/edit/Product1')
                .set(mockUser('Admin'));

            expect(res.status).toBe(200);
            expect(res.text).toContain('Product1');
        });

        it('should return an error if product does not exist', async () => {
            Produkt.findOne.mockResolvedValue(null);  // No product found

            const res = await request(app)
                .get('/products/edit/Product1')
                .set(mockUser('Admin'));

            expect(res.status).toBe(302);  // Redirect
            expect(res.header.location).toBe('/products');
        });
    });

    describe('POST /products/edit', () => {
        it('should update the product successfully', async () => {
            const updatedProduct = {
                _id: 'product123',
                name: 'Updated Product',
                price: 200,
                disabled: true,
                _ids: ['id1'],
                amount: [10]
            };

            const mockProduct = { ...updatedProduct };
            Produkt.findById.mockResolvedValue(mockProduct);
            Produkt.prototype.save.mockResolvedValue(mockProduct);

            const res = await request(app)
                .post('/products/edit')
                .send(updatedProduct)
                .set(mockUser('Admin'));

            expect(res.status).toBe(302);  // Redirection status code
            expect(res.header.location).toBe('/products');
            expect(res.flash.success_msg).toBe(`Prawidłowo zmodyfikowano produkt ${updatedProduct.name}`);
        });

        it('should handle errors during product update', async () => {
            const updatedProduct = {
                _id: 'product123',
                name: '',
                price: 0,
                disabled: true,
                _ids: [],
                amount: []
            };

            const res = await request(app)
                .post('/products/edit')
                .send(updatedProduct)
                .set(mockUser('Admin'));

            expect(res.status).toBe(200);
            expect(res.text).toContain('Uzupełnij wszystkie pola!');
        });
    });

    describe('POST /products/remove', () => {
        it('should delete the product and redirect', async () => {
            const productId = 'product123';
            const mockProduct = { name: 'Product to delete' };
            Produkt.findOneAndDelete.mockResolvedValue(mockProduct);

            const res = await request(app)
                .post('/products/remove')
                .send({ productId })
                .set(mockUser('Admin'));

            expect(res.status).toBe(302);  // Redirection status code
            expect(res.header.location).toBe('/products');
            expect(res.flash.success_msg).toBe(`Prawidłowo usunięto produkt ${mockProduct.name}`);
        });

        it('should handle errors during product deletion', async () => {
            const productId = 'product123';
            Produkt.findOneAndDelete.mockResolvedValue(null);  // No product deleted

            const res = await request(app)
                .post('/products/remove')
                .send({ productId })
                .set(mockUser('Admin'));

            expect(res.status).toBe(302);  // Redirect status code
            expect(res.header.location).toBe('/products');
            expect(res.flash.error).toBe('Błąd podczas usuwania Produktu!');
        });
    });

});
