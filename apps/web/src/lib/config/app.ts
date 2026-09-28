const ENV = import.meta.env;
export const STATIC_API_HOST = 'https://prime-box.xyz';

export const IS_DEV_MODE = ENV.MODE === 'development';
export const API_HOST = IS_DEV_MODE ? (ENV.VITE_API_HOST ?? STATIC_API_HOST) : STATIC_API_HOST;
