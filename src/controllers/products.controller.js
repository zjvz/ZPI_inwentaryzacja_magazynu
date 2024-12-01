const passport = require('passport');
const PolProdukt = require('../models/PolProdukt.js');
const Produkt = require('../models/Produkt.js');

module.exports = {
    /**
     * GET Products page
     * @description Wyświetla stronę z listą produktów 
     */
    getProductsPage: async (req, res, next) => {
        let produkty = await Produkt.find().populate('polProdukty');
        //res.send(JSON.stringify(produkty));
        res.render('products/index', { user: req.user, produkty});
    },

    
    /**
     * GET Add Product page
     * @description Wyświetla stronę z formularzem dodawania produktów
     */
    getAddProductPage: async (req, res, next) => {
        const polProdukty = await PolProdukt.find().populate('magazyn');
        //console.log(polProdukty);
        res.render('products/add', { user: req.user, polProdukty});
    },

    /**
     * POST Add Product page
     * @description Przetwarza dane z formularza dodawania produktów
     */
    postAddProduct: async (req, res, next) => {
        console.log(req.body)
        let { name, price, disabled, _ids, amount } = req.body;
        let errors = [];
        const polProdukty = await PolProdukt.find().populate('magazyn');

        if(!Array.isArray(_ids))
            _ids = new Array(_ids);
         
        if(!Array.isArray(amount))
            amount = new Array(amount);

        //console.log(_ids);
        //console.log(amount);

        if(!_ids || !amount){
            errors.push({ msg: 'Dodaj przynajmniej jeden Pół-Produkt!' });
        }

        if (!name || !price ) {
            errors.push({ msg: 'Uzupełnij wszystkie pola!' });
        }

       
        if(errors.length > 0)
            return res.render('products/add', { user: req.user, polProdukty, errors, newProdukt: req.body});
        
        const produktExist = await Produkt.findOne({name});
        if(produktExist){
            errors.push({ msg: 'Produkt o tej nazwie istnieje już w bazie!' });
            return res.render('products/add', { user: req.user, polProdukty, errors, newProdukt: req.body});
        }

        if(disabled == "on" || disabled == 1)
            disabled = true;
        else    
            disabled = false;
        let newProdukt = await Produkt.create({name, price, isDisabled: disabled});
        
        let i = 0;
        console.log(newProdukt);

        for(let spproduct of _ids){
            //polProduktyMap.set()
            //let polprodukt = await PolProdukt.findById(_ids[i]);
            newProdukt.polProdukty.push(_ids[i]);
            newProdukt.amount.push(amount[i]);
            i++;
        }
        //console.log(await newProdukt.populate('polProdukty'));

        newProdukt.save().then(_newProdukt => {
            req.flash('success_msg', `Prawidłowo dodano Produkt ${name}`);
            return res.redirect('/products');
        }).catch(err => {
            console.log(err);
            req.flash('error', 'Wystąpił wewnętrzny błąd serwera!');
            return res.render('products/add', { user: req.user, polProdukty, errors, newProdukt: req.body});
        });
        
        //res.send(JSON.stringify(req.body));
        //res.redirect('/products');
    },


    /**
     * GET EDIT Product 
     * @description Wyświetla stronę z formularzem edycji produktu
     */
    getEditProduct: async (req, res, next) => {
        const { name } = req.params;
        let errors = [];
        const produkt = await Produkt.findOne({name});

        if(!produkt){
            req.flash('error', 'Nie odnaleziono produktu!');
            return res.redirect('/products');
        }

        if(produkt.isDisabled)
            produkt.isDisabled = "1";
        else
            produkt.isDisabled = "0";

        console.log(produkt);

        const polProdukty = await PolProdukt.find().populate('magazyn');
        console.log("polprodukty:", produkt);
        return res.render('products/edit', { user: req.user, polProdukty, errors, produkt, newProdukt: req.body});
    },

    /**
     * POST EDIT Product 
     * @description Przyjmuje dane z forumularza edycji produktu
     */
    postEditProduct: async (req, res, next) => {
        //res.send(JSON.stringify(req.body));
        let { _id, _name, name, price, disabled, _ids, amount } = req.body;
        let errors = [];
        const polProdukty = await PolProdukt.find().populate('magazyn');

        if(!Array.isArray(_ids))
            _ids = new Array(_ids);
         
        if(!Array.isArray(amount))
            amount = new Array(amount);

        if(_ids.length == 0 || amount.length == 0){
            errors.push({ msg: 'Dodaj przynajmniej jeden Pół-Produkt!' });
        }

        if (!name || !price ) {
            errors.push({ msg: 'Uzupełnij wszystkie pola!' });
        }

        if( !_id || !_name) {
            errors.push({ msg: 'Przesłano niepoprawny formularz!' });
        }

       
        if(errors.length > 0){
            let errorsString = '';
            for(let error of errors){
                errorsString += (error.msg + " ");
            }
            console.log(errorsString);
            req.flash('error', `Błąd podczas edycji Produktu!\n${errorsString}`);
            return res.redirect(`/products/edit/${_name}`);
        }
        
        const produkt = await Produkt.findById({_id});
        if(!produkt){
            req.flash('error', 'Błąd podczas edycji Produktu!');
            return res.redirect(`/products/edit/${_name}`);
        }

                
        if(disabled == "on" || disabled == 1)
            disabled = true;
        else    
            disabled = false;

        produkt.name = name;
        produkt.price = price;
        produkt.isDisabled = disabled;
        produkt.polProdukty = _ids;
        produkt.amount = amount;

        console.log("PreSave:", produkt);

        produkt.save().then(_produkt => {
            req.flash('success_msg', `Prawidłowo zmodyfikowano produkt ${_name}`);
            console.log("PostSave:", _produkt);
            return res.redirect('/products');
        }).catch(err => {
            console.log(err);
            req.flash('error', 'Wystąpił wewnętrzny błąd serwera!');
            return res.redirect(`/products/edit/${_name}`);
        });

    },


    /**
     * POST REMOVE Product API
     * @description Przetwarza dane z formularza usuwania produktów
     */
    postRemoveProduct: async (req, res, next) => {
        const { productId } = req.body;
        console.log(req.body);
        if (!productId) {
            req.flash('error', 'Błąd podczas usuwania Produktu!');
            return res.redirect('/products');
        }

        Produkt.findOneAndDelete({_id: productId}, (err, produkt) => {
            if(produkt){
                req.flash('success_msg', `Prawidłowo usunięto produkt ${produkt.name}`);
            }else{
                req.flash('error', 'Błąd podczas usuwania Produktu!');
            }
            return res.redirect('/products');
        });
    },

}