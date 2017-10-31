const {assert} = require('chai');
const Event = require('../../lib/models/event');

describe('Event model', () => {
    const event = new Event({

    });

    it('should validate a good model', () => {
        const validate = event.validateSync();
        assert.equal(validate, undefined);
    });

    it('', () => {
        const badEvent = new Event({}); 
        const {errors} = badEvent.validateSync();
        assert.equal(errors.event.kind,'required');
    });
});