const router = require('express').Router();
const superagent = require('superagent');
const Planet = require('../models/planet');

router 
    .get('/', (req, res) => {
        const pageArr = [];
        const catalogArr = Array(7).fill();        
        
        return Promise.all(
            catalogArr.map((item, i) => {
                const planetsUrl = `https://swapi.co/api/planets/?page=${i+1}`;
                return superagent.get(planetsUrl)
                    .then(planetRes => {
                        const results = planetRes.body.results;
                        results.forEach(items => {
                            pageArr.push(items);
                        });
                    })
                    .catch(err => console.log(err));
            })
        )
            .then(() => {
                return Promise.all(pageArr.map(ele => {
                    return new Planet(ele).save();
                }));
            })
            .then(() => {
                return Planet.find({}).lean();
            })
            .then(found => {
                res.json(found);
            });
            
    });

module.exports = router;