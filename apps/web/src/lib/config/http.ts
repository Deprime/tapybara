import ky from 'ky';

const http = ky.create({
  credentials: 'include',
  retry: 0
});

export default http;
