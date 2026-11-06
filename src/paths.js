export const siteBase = import.meta.env.BASE_URL;
export const sitePath = path => siteBase + path.replace(/^\/+/, '');
export const localePath = (lang, part = '') => sitePath(`${lang}/${part}`);
