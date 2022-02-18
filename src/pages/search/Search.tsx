import { getData, getSearchData, medicineDataProps } from 'api/api';
import SearchInput from 'components/SearchInput';
import { MEDICINE, SEARCH_LIST } from 'constant/costants';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';

export default function Search() {
  const [sortedProducts, setSortedProducts] = useState<medicineDataProps[]>([]);
  const location = useLocation();
  const [isRefetching, setIsRefetching] = useState(false);

  const searchWords: string | null = new URLSearchParams(location.search).get(
    'q'
  );

  const firstWord: string | undefined = searchWords
    ?.toString()
    .trim()
    .replace(/,/g, ' ')
    .split(' ')[0];

  const spacedWords = searchWords
    ?.toString()
    .trim()
    .replace(/,/g, ' ')
    .split(' ')[1];

  const { data: allData } = useQuery<medicineDataProps[]>([MEDICINE], getData);

  const { data: searchData } = useQuery<medicineDataProps[]>(
    [MEDICINE, SEARCH_LIST],
    () => getSearchData(firstWord ? firstWord : ''),
    { refetchInterval: isRefetching ? 100 : 0 }
  );

  useEffect(() => {
    setIsRefetching(true);
    if (!searchData) return;
    const newAlignedObject = searchData?.sort(
      (a: medicineDataProps, b: medicineDataProps) => {
        let aIndex = a.name.indexOf(spacedWords ? spacedWords : '');
        let bIndex = b.name.indexOf(spacedWords ? spacedWords : '');
        return bIndex - aIndex;
      }
    );
    // 양성호가 추가한 로직

    const brandTopResult = [];
    for (let i = 0; i < newAlignedObject.length; i++) {
      if (newAlignedObject[i].brand) {
        brandTopResult.push(newAlignedObject[i]);
      }
    }
    for (let i = 0; i < newAlignedObject.length; i++) {
      if (!newAlignedObject[i].brand) {
        brandTopResult.push(newAlignedObject[i]);
      }
    }

    // 임보슬 로직 - 일치하는 글자 수대로 나열
    const searchKeyword = decodeURI(location.search).split('=')[1];
    const matchingKeyword = brandTopResult.reduce((acc: Array<medicineDataProps>, value: medicineDataProps) => {
      if (value.name.includes(searchKeyword)) {
        acc.push({
          name: value.name,
          brand: !value.brand ? '' : value.brand
        });
      }
      return acc;
    }, []);

    setSortedProducts(matchingKeyword);
    setTimeout(() => {
      setIsRefetching(false);
    }, 400);
  }, [location, searchData, spacedWords]);

  return (
    <div>
      {allData && <SearchInput data={allData} />}
      Search
      <ul>
        {sortedProducts &&
          sortedProducts.map((item, idx) => (
            <div key={idx}>
              <li>
                <span>
                  제품명 :{item.name}{' '}
                  {item.brand && <span> / 브랜드 : {item.brand}</span>}
                </span>
              </li>
            </div>
          ))}
      </ul>
    </div>
  );
}
