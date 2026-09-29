import http from '$lib/config/http';
import type { UnitRarity, UnitStatus } from '@capyberries/shared';

const PREFIX = '/api/units';

/** Unit row as returned by GET /api/units and POST /:id/collect. */
export type UnitListItem = {
  id: number;
  skin_uuid: string;
  name: string;
  level: number;
  rarity: UnitRarity;
  status: UnitStatus;
  exp: number;
  balance_sol: number;
  points: number;
  /** Unix seconds of the last harvest. */
  harvest_at: number;
};

const unitsApi = {
  /**
   * Units of the current session user
   */
  list: () => {
    const url = `${PREFIX}`;
    return http.get(url).json<UnitListItem[]>();
  },

  /**
   * Collect clicks for one unit; responds with the refreshed unit list
   */
  collect: (unit_id: number, clicks: number[]) => {
    const url = `${PREFIX}/${unit_id}/collect`;
    return http.post(url, { json: { clicks } }).json<UnitListItem[]>();
  }
};

export default unitsApi;
