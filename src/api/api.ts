export interface medicineDataProps {
  name: string;
  brand?: string;
}

const BASE_URL = 'https://dry-hollows-03672.herokuapp.com/medicine';

export const getData = () => {
  return fetch(BASE_URL).then((res) => res.json());
};
export const getSearchData = (text: string) => {
  return fetch(`${BASE_URL}/?q=${text}`).then((res) => res.json());
};
