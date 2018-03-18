import test from 'ava';
import {} from '../src/npm-template-sync-github-hook';

const got = require('got');

test('request', async t => {
  const response = await got.post(`http://localhost:3000/webhook`);

  console.log(response.body);

  t.is(response.statusCode, 200);
});
