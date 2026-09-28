import http from '$lib/config/http';

const PREFIX = '/api/health';

type HealthResponse = {
  status: 'ok';
  database: 'connected' | 'unavailable';
};

const healthApi = {
  /**
   * Liveness + DB connectivity probe
   */
  check: () => {
    const url = `${PREFIX}`;
    return http.get(url).json<HealthResponse>();
  }
};

export default healthApi;
