import ky, {
  // isHTTPError,
  type Options
} from 'ky';

// import {
//   clearCookieAccessToken,
//   getCookieAccessToken,
//   setCookieAccessToken
// } from '$lib/helpers/cookie';
import type { SessionResponse } from '$lib/types/auth';

// import { API_HOST, IS_DEV_MODE } from '$lib/config/app';

const options: Options = {
  // baseUrl: IS_DEV_MODE ? undefined : API_HOST,
  credentials: 'include'
};

const http = ky.create({
  ...options,
  retry: {
    // limit: 2,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    statusCodes: [401],
    afterStatusCodes: [401]
    // shouldRetry: ({ error }) => {
    //   // Retry on specific business logic errors from API
    //   if (isHTTPError(error)) {
    //     const status = error.response.status;

    //     // Retry on 401 if we have an access token
    //     if (status === 401) {
    //       return true;
    //     }

    //     // Don't retry on 4xx errors except rate limits
    //     if (status >= 400 && status < 500) {
    //       return false;
    //     }
    //   }

    //   // Use default retry logic for other errors
    //   return undefined;
    // }
  },
  hooks: {
    beforeRequest: [
      // ({ request }) => {
      //   const accessToken = getCookieAccessToken();
      //   if (accessToken) {
      //     request.headers.set('Authorization', `Bearer ${accessToken}`);
      //   }
      // }
    ],

    beforeRetry: [
      async ({ request }) => {
        try {
          const url = `/api/auth/refresh`;
          const client = ky.create({ ...options });
          const response = await client.post(url).json<SessionResponse>();
          return request;
        } catch (error) {
          console.error(error);
          return request;
        }
      }
    ]
  }
});

export default http;
