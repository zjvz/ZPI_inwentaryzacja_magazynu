const request = require('supertest');
const express = require('express');
const passport = require('passport');
const mockingoose = require('mockingoose');
const storagesController = require('../controllers/storagesController');
const Magazyn = require('../models/Magazyn');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/storages', storagesController.getStoragesPage);
app.get('/storages/add', storagesController.getAddStoragePage);
app.post('/storages/add', storagesController.postAddStorage);
app.post('/storages/edit', storagesController.postEditStorage);

describe('Storages Controller', () => {
    afterEach(() => {
        mockingoose.resetAll();
    });

    describe('GET /storages', () => {
        it('should render storages page with data', async () => {
            // Mock Magazyn data
            mockingoose(Magazyn).toReturn([{ name: 'Magazyn 1', location: 'Location 1', shortcut: 'M1' }], 'find');

            const response = await request(app).get('/storages');
            expect(response.status).toBe(200);
            expect(response.text).toContain('Magazyn 1');  // Assuming your template renders this
        });
    });

    describe('GET /storages/add', () => {
        it('should render the add storage page', async () => {
            const response = await request(app).get('/storages/add');
            expect(response.status).toBe(200);
            expect(response.text).toContain('Add Storage'); // Ensure your add page contains "Add Storage" text
        });
    });

    describe('POST /storages/add', () => {
        it('should add a new storage and redirect', async () => {
            const newStorage = { name: 'Magazyn 2', location: 'Location 2', shortcut: 'M2' };

            // Mock Magazyn data to return null for findOne (no existing storage)
            mockingoose(Magazyn).toReturn(null, 'findOne');
            mockingoose(Magazyn).toReturn(newStorage, 'save');

            const response = await request(app)
                .post('/storages/add')
                .send(newStorage);

            expect(response.status).toBe(302); // Redirect
            expect(response.header.location).toBe('/storages'); // Redirect to /storages page
        });

        it('should show error if any field is missing', async () => {
            const incompleteStorage = { name: '', location: 'Location 2', shortcut: 'M2' };

            const response = await request(app)
                .post('/storages/add')
                .send(incompleteStorage);

            expect(response.status).toBe(200);
            expect(response.text).toContain('Uzupełnij wszystkie pola!');
        });

        it('should show error if storage already exists', async () => {
            const existingStorage = { name: 'Magazyn 2', location: 'Location 2', shortcut: 'M2' };

            // Mock Magazyn data to return an existing storage
            mockingoose(Magazyn).toReturn(existingStorage, 'findOne');

            const response = await request(app)
                .post('/storages/add')
                .send(existingStorage);

            expect(response.status).toBe(200);
            expect(response.text).toContain('Nazwa oraz skrót magazyny muszą być unikalne!');
        });
    });

    describe('POST /storages/edit', () => {
        it('should update a storage and redirect', async () => {
            const updatedStorage = { prevName: 'Magazyn 2', type: 'edit', name: 'Magazyn 2 Updated', location: 'Location 2', shortcut: 'M2U' };

            // Mock Magazyn update
            mockingoose(Magazyn).toReturn(updatedStorage, 'findOneAndUpdate');

            const response = await request(app)
                .post('/storages/edit')
                .send(updatedStorage);

            expect(response.status).toBe(302);
            expect(response.header.location).toBe('/storages');
        });

        it('should show error when required fields are missing during edit', async () => {
            const invalidEdit = { prevName: 'Magazyn 2', type: 'edit', name: '', location: '', shortcut: '' };

            const response = await request(app)
                .post('/storages/edit')
                .send(invalidEdit);

            expect(response.status).toBe(302);
            expect(response.header.location).toBe('/storages');
        });

        it('should show error when storage is not found during edit', async () => {
            const invalidEdit = { prevName: 'NonExistentMagazyn', type: 'edit', name: 'New Name', location: 'New Location', shortcut: 'N' };

            mockingoose(Magazyn).toReturn(null, 'findOneAndUpdate');

            const response = await request(app)
                .post('/storages/edit')
                .send(invalidEdit);

            expect(response.status).toBe(302);
            expect(response.header.location).toBe('/storages');
        });
    });
});
