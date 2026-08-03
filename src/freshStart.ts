import { CASE_ID } from './build';

export {};

const params = new URLSearchParams(window.location.search);
const shouldStartFresh = params.get('fresh') === '1' || params.get('newCase') === '1';

if (shouldStartFresh) {
  const prefix = `dbr:${CASE_ID}`;

  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(prefix)) localStorage.removeItem(key);
  }

  for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith(prefix)) sessionStorage.removeItem(key);
  }

  params.delete('fresh');
  params.delete('newCase');
  const query = params.toString();
  const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', cleanUrl);

  document.documentElement.dataset.dbrFreshStart = 'true';
}
