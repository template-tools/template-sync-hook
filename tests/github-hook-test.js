import test from 'ava';
import {} from '../src/npm-template-sync-github-hook';

const got = require('got');
const { signer } = require('x-hub-signature');

test('request', async t => {
  const sign = signer({ algorithm: 'sha1', secret: 'dfgkjd&dfh' });
  const signature = sign(new Buffer('random-signature-body'));

  const response = await got.post(`http://localhost:3000/webhook`, {
    headers: {
      'x-hub-signature': signature,
      'x-github-event': 'push',
      'x-github-delivery': '77'
    }
  });

  console.log(response.body);

  t.is(response.statusCode, 200);
});
