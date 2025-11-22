import { Destination, TransportMode } from '@/types/trip';

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || '';

// 네이버 지도 스크립트 로드
export const loadNaverMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.naver?.maps) {
      resolve();
      return;
    }

    if (!NAVER_CLIENT_ID) {
      reject(new Error('NAVER_CLIENT_ID is not set'));
      return;
    }

    const script = document.createElement('script');
    // 🔥 중요: ncpKeyId로 변경! (이전: ncpClientId)
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`;
    script.async = true;
    script.onload = () => {
      console.log('✅ 네이버 지도 로드 성공');
      resolve();
    };
    script.onerror = () => {
      console.error('❌ 네이버 지도 로드 실패 - Client ID를 확인하세요');
      reject(new Error('Failed to load Naver Maps'));
    };
    document.head.appendChild(script);
  });
};

// 지도 초기화
export const initNaverMap = (
  mapElement: HTMLElement,
  center: { lat: number; lng: number }
): naver.maps.Map => {
  return new naver.maps.Map(mapElement, {
    center: new naver.maps.LatLng(center.lat, center.lng),
    zoom: 12,
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.TOP_RIGHT,
    },
  });
};

// 마커 추가
export const addNaverMarkers = (
  map: naver.maps.Map,
  destinations: Destination[]
): naver.maps.Marker[] => {
  return destinations.map((dest, index) => {
    const marker = new naver.maps.Marker({
      map,
      position: new naver.maps.LatLng(dest.lat, dest.lng),
      title: dest.name,
      icon: {
        content: `
          <div style="
            background: #4285F4;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            ${index + 1}
          </div>
        `,
        anchor: new naver.maps.Point(16, 16),
      },
    });

    // 정보창
    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${dest.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${dest.address}</p>
        </div>
      `,
    });

    naver.maps.Event.addListener(marker, 'click', () => {
      infoWindow.open(map, marker);
    });

    return marker;
  });
};

// 경로 그리기 (직선 또는 API 경로)
export const drawNaverRoute = async (
  map: naver.maps.Map,
  destinations: Destination[],
  mode: TransportMode
): Promise<naver.maps.Polyline | null> => {
  if (destinations.length < 2) return null;

  // 클라우드 API 사용 가능 여부 확인
  const hasCloudAPI = process.env.NAVER_CLIENT_SECRET;

  if (hasCloudAPI && mode === 'DRIVING') {
    try {
      // Directions 5 API 시도
      const start = `${destinations[0].lng},${destinations[0].lat}`;
      const goal = `${destinations[destinations.length - 1].lng},${destinations[destinations.length - 1].lat}`;
      
      const waypoints = destinations
        .slice(1, -1)
        .slice(0, 5)
        .map(d => `${d.lng},${d.lat}`)
        .join('|');

      const url = `/api/naver/directions5?start=${start}&goal=${goal}${waypoints ? `&waypoints=${waypoints}` : ''}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.route?.traoptimal?.[0]?.path) {
          const path = data.route.traoptimal[0].path.map(
            (p: [number, number]) => new naver.maps.LatLng(p[1], p[0])
          );

          console.log('✅ Directions API 성공');
          
          return new naver.maps.Polyline({
            map,
            path,
            strokeColor: '#4285F4',
            strokeWeight: 6,
            strokeOpacity: 0.8,
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Directions API 실패 - 직선으로 표시합니다', error);
    }
  }

  // 실패 시 또는 클라우드 API 없음: 직선 경로
  console.log('ℹ️ 직선 경로로 표시');
  
  const path = destinations.map(
    d => new naver.maps.LatLng(d.lat, d.lng)
  );

  const colorMap = {
    DRIVING: '#4285F4',
    WALKING: '#EA4335',
    TRANSIT: '#34A853',
    BICYCLING: '#FBBC04',
  };

  return new naver.maps.Polyline({
    map,
    path,
    strokeColor: colorMap[mode] || '#9CA3AF',
    strokeWeight: mode === 'DRIVING' ? 5 : 4,
    strokeOpacity: 0.7,
    strokeStyle: mode === 'DRIVING' ? 'solid' : 'shortdash',
  });
};

// 장소 검색 (네이버 로컬 검색 API)
export const searchNaverPlaces = async (query: string): Promise<any[]> => {
  try {
    const response = await fetch(`/api/naver/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};

// Geocoding (주소 -> 좌표) - Open API 방식으로 대체
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    // 네이버 클라우드 API 시도
    const hasCloudAPI = process.env.NAVER_CLIENT_SECRET;
    
    if (hasCloudAPI) {
      const response = await fetch(`/api/naver/geocode?address=${encodeURIComponent(address)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.addresses && data.addresses.length > 0) {
          console.log('✅ Geocoding API 성공');
          return {
            lat: parseFloat(data.addresses[0].y),
            lng: parseFloat(data.addresses[0].x),
          };
        }
      }
    }
    
    // 실패 시: 로컬 검색 결과에서 좌표 추출 시도
    console.warn('⚠️ Geocoding API 실패 - 검색 결과의 좌표 사용');
    
    const searchResults = await searchNaverPlaces(address);
    if (searchResults.length > 0) {
      const first = searchResults[0];
      // 로컬 검색 API는 mapx, mapy로 좌표 제공 (카텍 좌표계)
      // 네이버 지도 좌표로 변환 필요
      if (first.mapx && first.mapy) {
        return {
          lng: parseFloat(first.mapx) / 10000000,
          lat: parseFloat(first.mapy) / 10000000,
        };
      }
    }
    
    console.error('❌ 좌표 변환 실패');
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
};

// 경로 소요시간 계산
export const getNaverRouteDurations = async (
  destinations: Destination[],
  mode: TransportMode
): Promise<string[]> => {
  const durations: string[] = [];

  for (let i = 0; i < destinations.length - 1; i++) {
    try {
      const start = `${destinations[i].lng},${destinations[i].lat}`;
      const goal = `${destinations[i + 1].lng},${destinations[i + 1].lat}`;

      const response = await fetch(
        `/api/naver/directions5?start=${start}&goal=${goal}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.route?.traoptimal?.[0]?.summary) {
          const duration = Math.round(data.route.traoptimal[0].summary.duration / 60000);
          durations.push(`${duration}분`);
        } else {
          durations.push('알 수 없음');
        }
      } else {
        durations.push('알 수 없음');
      }
    } catch (error) {
      durations.push('알 수 없음');
    }
  }

  return durations;
};

// 최적 경로 계산 (간단한 버전 - TSP 근사)
export const getOptimizedNaverRoute = async (
  destinations: Destination[],
  mode: TransportMode
): Promise<Destination[] | null> => {
  if (destinations.length < 3) return null;

  try {
    // 첫 번째와 마지막은 고정
    const start = destinations[0];
    const end = destinations[destinations.length - 1];
    const middle = destinations.slice(1, -1);

    // 거리 기반 간단한 최적화 (가장 가까운 다음 목적지 선택)
    const optimized = [start];
    const remaining = [...middle];

    let current = start;
    while (remaining.length > 0) {
      let nearest = remaining[0];
      let minDistance = getDistance(current, nearest);

      for (const dest of remaining) {
        const distance = getDistance(current, dest);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = dest;
        }
      }

      optimized.push(nearest);
      remaining.splice(remaining.indexOf(nearest), 1);
      current = nearest;
    }

    optimized.push(end);
    return optimized;
  } catch (error) {
    console.error('Route optimization failed:', error);
    return null;
  }
};

// 두 지점 간 거리 계산 (Haversine)
const getDistance = (a: Destination, b: Destination): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * c;
};

// TypeScript 타입 선언
declare global {
  interface Window {
    naver: typeof naver;
  }
}