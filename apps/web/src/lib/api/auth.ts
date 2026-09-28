import http from '$lib/config/http';
import type { SessionResponse } from '$lib/types/auth';

const PREFIX = '/api/auth';

const authApi = {
  /**
   * Current session user; throws HTTPError 401 without a valid session
   */
  me: () => {
    const url = `${PREFIX}/me`;
    return http.get(url).json<SessionResponse>();
  },

  /**
   * Delete the server-side session and its cookie
   */
  logout: () => {
    const url = `${PREFIX}/logout`;
    return http.post(url).json<{ ok: true }>();
  }
};

export default authApi;
