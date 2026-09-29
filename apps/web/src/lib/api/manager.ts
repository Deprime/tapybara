import http from '$lib/config/http';
import type { Skin, UnitRarity } from '@capyberries/shared';

const PREFIX = '/api/manager';

/** User row as returned by GET /api/manager/users. */
export type ManagerUserListItem = {
  id: number;
  telegram_id: number;
  username: string;
  balance_sol: number;
};

/** Unit created by POST /api/manager/users/:id/units. */
export type ManagerUnit = {
  id: number;
  name: string;
  rarity: UnitRarity;
  skin_uuid: string;
};

const managerApi = {
  /**
   * All unit skins; throws HTTPError 403 unless the session user is an admin
   */
  skins: () => {
    const url = `${PREFIX}/skins`;
    return http.get(url).json<Skin[]>();
  },

  /**
   * All users; throws HTTPError 403 unless the session user is an admin
   */
  users: () => {
    const url = `${PREFIX}/users`;
    return http.get(url).json<ManagerUserListItem[]>();
  },

  /**
   * Grant the user a fresh base-rarity unit with a random base skin
   */
  createUnit: (user_id: number) => {
    const url = `${PREFIX}/users/${user_id}/units`;
    return http.post(url).json<ManagerUnit>();
  }
};

export default managerApi;
