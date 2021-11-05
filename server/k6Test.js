import http from 'k6/http';
import { sleep } from 'k6';

//styles request url: 'http://localhost:3009/products/' + '999'+ Math.floor(Math.random() * 999).toString() + '/styles';
//product details url: 'http://localhost:3009/products/' + '999'+ Math.floor(Math.random() * 999).toString() + '/';
//only producs url: 'http://localhost:3009/products/';
//related request url: 'http://localhost:3009/products/' + '999'+ Math.floor(Math.random() * 999).toString() + '/related';
//command to run test:  k6 run ./server/k6Test.js


export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 2100,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '1m',
      preAllocatedVUs: 1000, // how large the initial pool of VUs would be
      maxVUs: 5000, // if the preAllocatedVUs are not enough, we can initialize more
    },
  },
};

export default function () {
  let requestURL = 'http://localhost:3009/products/' + '999'+ Math.floor(Math.random() * 999).toString() + '/related';
  const res = http.get(requestURL);
  console.log('REQUEST TO: ', requestURL);
  console.log('Response time was ' + String(res.timings.duration) + ' ms');
  sleep(1);
}
