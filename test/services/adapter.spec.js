/* eslint-env mocha */
const { assert } = require('chai');
const sinon = require('sinon');

const { WTAdapter } = require('../../src/services/adapter');

describe('services - adapter', function () {
  let wtAdapter;

  beforeEach(async () => {
    wtAdapter = new WTAdapter('hotelId', 'htttp://readApiUrl.com',
      'http://writeApiUrl.com', 'writeApiAccessKey', 'writeApiWalletPassword');
    wtAdapter.__availability = { count: 10 };
    sinon.stub(wtAdapter, '_getAvailability').callsFake(() => {
      return Promise.resolve(wtAdapter.__availability);
    });
    sinon.stub(wtAdapter, '_applyUpdate').callsFake((orig, update) => {
      if (update === 'fail') {
        return Promise.reject(new Error('Failed update'));
      }
      return Promise.resolve({ count: orig.count - 1 });
    });
    sinon.stub(wtAdapter, '_setAvailability').callsFake((availability) => {
      wtAdapter.__availability = availability;
      return Promise.resolve();
    });
  });

  describe('WTAdapter.updateAvailability', () => {
    it('should update the availability', async () => {
      assert.deepEqual(wtAdapter.__availability, { count: 10 });
      await wtAdapter.updateAvailability({});
      assert.deepEqual(wtAdapter.__availability, { count: 9 });
    });

    it('should serialize updates', async () => {
      await Promise.all([
        wtAdapter.updateAvailability({}),
        wtAdapter.updateAvailability({}),
        wtAdapter.updateAvailability({}),
        wtAdapter.updateAvailability({}),
      ]);
      assert.deepEqual(wtAdapter.__availability, { count: 6 });
    });

    it('should handle single failures', async () => {
      await Promise.all([
        wtAdapter.updateAvailability({}),
        wtAdapter.updateAvailability('fail').catch(() => {}),
        wtAdapter.updateAvailability({}),
        wtAdapter.updateAvailability({}),
      ]);
      assert.deepEqual(wtAdapter.__availability, { count: 7 });
    });
  });
});
