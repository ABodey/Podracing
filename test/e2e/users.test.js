const { assert } = require('chai');
const request = require('./request');
const db = require('./db');
const seedCharacters = require('../../lib/scripts/seed-characters');
const seedVehicles = require('../../lib/scripts/seed-vehicles');
const seedPlanets = require('../../lib/scripts/seed-planets');
const createRace = require('../../lib/scripts/create-race');
const Character = require('../../lib/models/character');
const Vehicle = require('../../lib/models/vehicle');
const Race = require('../../lib/models/race');

describe('User routes test', () => {
    let newUser = null;
    let userToken = null;

    beforeEach(function () {
        this.timeout(10000);
        db.drop();

        newUser = {
            name: 'xXcYbEr_GoKu_666Xx',
            email: '10_yr_old_hacker@gmail.com',
            password: '123hello',
            bankroll: '20000'
        };
    
        return request
            .post('/api/users/signup')
            .send(newUser)
            .then( ({body}) => {
                userToken = body.token;
            });
    });

    describe('Character route tests', () => {
        beforeEach( function()  {
            this.timeout(10000);
            return seedCharacters();
        });

        it('should get a character by id and add to user property', () => {
            let sample = null;
            return Character.findOne().lean()
                .then(found => {
                    sample = found;
                })
                .then(() => request.put(`/api/users/getchar/${sample._id}`)
                    .set('Authorization', userToken)
                )    
                .then(got => {
                    assert.ok(got.body.character);
                });
        });

        it('should reject character putById when user already has character', () => {
            const userWithCharacter = {
                name: 'online_user_2422352',
                email: '11_yr_old_hacker@gmail.com',
                password: '123hello',
                character: '59fa55bf389b3782d8cceac7'
            };

            let userToken = null;
            let sample = null;

            return request
                .post('/api/users/signup')
                .send(userWithCharacter)
                .then(({body}) => {
                    userToken = body.token;
                })
                .then(() => {
                    return Character.findOne().lean()
                        .then(found => {
                            sample = found;
                        })
                        .then(() => request.put(`/api/users/getchar/${sample._id}`)
                            .set('Authorization', userToken)
                        )    
                        .catch(err => {
                            assert.equal(err.status, 400);
                        });
                });    
        });
        
        it('should turn the user character property to null', () => {
            const userWithCharacter = {
                name: 'online_user_2422352',
                email: '11_yr_old_hacker@gmail.com',
                password: '123hello',
                character: '59fa55bf389b3782d8cceac7'
            };

            let userToken = null;
            let sample = null;

            return request
                .post('/api/users/signup')
                .send(userWithCharacter)
                .then(({body}) => {
                    userToken = body.token;
                })
                .then(() => {
                    return Character.findOne().lean()
                        .then(found => {
                            sample = found;
                        })
                        .then(() => request.put(`/api/users/clearchar/${sample._id}`)
                            .set('Authorization', userToken)
                        )    
                        .then(got => {
                            assert.equal(got.body.character, null);
                        });
                });
        });
    });

    describe('Vehicle route tests', () => {
        beforeEach( function()  {
            this.timeout(10000);
            return seedVehicles();
        });

        it('should get a vehicle by id and add to user property if affordable', () => {
            let sample = null;

            return Vehicle.find().where('cost_in_credits').lt(20000).lean()
                .then(found => {
                    sample = found[0];
                })
                .then(() => request.put(`/api/users/getvehicle/${sample._id}`)
                    .set('Authorization', userToken)
                )    
                .then(got => {
                    assert.ok(got.body.vehicle);
                });
        });
       
        it('should throw err if vehicle cost is gt bankroll', () => {
            let sample = null;

            return Vehicle.find().where('cost_in_credits').gt(30000).lean()
                .then(found => {
                    sample = found[0];
                })
                .then(() => request.put(`/api/users/getvehicle/${sample._id}`)
                    .set('Authorization', userToken)
                )    
                .then(() => {
                    throw new Error ('unexpected success');
                })
                .catch(err => {
                    assert.equal(err.status, 400);
                });
        }); 

        describe('Join race routes', () => {
            beforeEach( function()  {
                this.timeout(60000);
                return seedVehicles()
                    .then(() => seedCharacters())
                    .then(() => seedPlanets())
                    .then(() => createRace());
            });

            it('should throw err for ineligible', () => {
                const userWithoutCharacter = {
                    name: 'online_user_2422352',
                    email: '11_yr_old_hacker@gmail.com',
                    password: '123hello',
                    character: null,
                };

                let userToken = null;
                let toJoin = null;

                return createRace()
                    .then( () => Race.findOne())
                    .then( got => {
                        toJoin = got;
                    })
                    .then( () =>{
                        return request
                            .post('/api/users/signup')
                            .send(userWithoutCharacter);
                    })
                    .then(({body}) => {
                        userToken = body.token;
                    })
                    .then( () => {
                        return request.put(`/api/users/joinrace/${toJoin.id}`)
                            .set('Authorization', userToken);
                    })  
                    .catch(err => {
                        assert.equal(err.status, 400);
                    }); 
            });

            it('should allow user to join a race', () => {
                let toJoin = null;

                return createRace()
                    .then( () => Race.findOne())
                    .then( got => {
                        toJoin = got;
                        return request.put(`/api/users/joinrace/${toJoin.id}`)
                            .set('Authorization', userToken);
                    })
                    .then( () =>  Race.findById(toJoin.id))
                    .then( got => {
                        assert.equal(got.users.length, 2);
                    });
            });
        });
    });
});