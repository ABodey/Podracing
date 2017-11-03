const { assert } = require('chai');
const request = require('./request');
const db = require('./db');

describe('Races test', () => {
    beforeEach(() => db.drop());

    let planet = {
        name: 'hoth',
    };
    let hothRace = null;

    beforeEach(() => {
        return request.post('/api/planets')
            .send(planet)
            .then(res => {
                planet = res.body;
                hothRace = {
                    planet: planet._id,
                    endTime: Date.parse(new Date)+1000,
                    active: true,
                    prize: 1234
                };
            });
    });    

    it('posts a race to the api', () => {
        return request.post('/api/races')
            .send({
                planet: planet._id,
                endTime: Date.parse(new Date),
                active: true,
                prize: 1234
            })
            .then(res => {
                const race = res.body;
                assert.ok(race._id);
                assert.equal(race.planet, hothRace.planet);
            });
    });

    //  TODO: change getById to put, move to user routes
    it.skip('gets a race by id', () => {
        let race = null;
        return request.put('/api/races')
            .send(hothRace)
            .then(res => {
                race = res.body;
                return request.get(`/api/races/${race._id}`);
            })
            .then(res => {
                assert.equal(res.body._id, race._id);
            });
    });

    it('returns a 404 for bad id', () => {
        return request.get('/api/races/59dfeaeb083bf9badcc97ce8')
            .then(
                () => { throw new Error('Incorrect id');},
                err => {
                    assert.equal(err.status, 404);
                });
    });
});