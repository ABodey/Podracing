const { assert } = require('chai');
const seedCharacters = require('../../lib/scripts/seed-characters');
const db = require('./db');
const Character = require('../../lib/models/character');
const Planet = require('../../lib/models/planet');
const Vehicle = require('../../lib/models/vehicle');


describe('Seed Data test', () => {
    before(()=> {
        db.drop();
    });

    function testSeedData(Model, seedFn){
        describe(Model.modelName, () => {

            let seedCount = 0;

            it('should seed data from api into db', function() {
                this.timeout(15000);
                return seedFn()
                    .then(() => {
                        return Model.find().count();
                    })
                    .then(count => {
                        seedCount = count;
                        assert.isOk(count > 0);
                    });
            });
        });
    }
});