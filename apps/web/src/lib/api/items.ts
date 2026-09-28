import http from '$lib/config/http';
import type { CreateItemInput, Item, UpdateItemInput } from '@capyberries/shared';

const PREFIX = '/api/items';

const itemsApi = {
  /**
   * Return all demo items
   */
  list: () => {
    const url = `${PREFIX}`;
    return http.get(url).json<Item[]>();
  },

  /**
   * Create an item
   */
  create: (input: CreateItemInput) => {
    const url = `${PREFIX}`;
    return http.post(url, { json: input }).json<Item>();
  },

  /**
   * Partially update an item
   */
  update: (id: number, input: UpdateItemInput) => {
    const url = `${PREFIX}/${id}`;
    return http.patch(url, { json: input }).json<Item>();
  },

  /**
   * Delete an item; the server answers 204 without body, so no .json()
   */
  remove: (id: number) => {
    const url = `${PREFIX}/${id}`;
    return http.delete(url);
  }
};

export default itemsApi;
