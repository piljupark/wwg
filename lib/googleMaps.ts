import { Loader } from '@googlemaps/js-api-loader';
import { Destination, TransportMode } from '@/types/trip';

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places', 'geometry'],
});

let google: typeof globalThis.google | null = null;

export const loadGoogleMaps = async () => {
  if (google) return google;
  google = await loader.load();
  return google;
};

export const searchPlaces = async (query: string): Promise<any[]> => {
  const google = await loadGoogleMaps();
  const service = new google.maps.places.PlacesService(
    document.createElement('div')
  );

  return new Promise((resolve) => {
    service.textSearch({ query }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else {
        // 모든 경우에 빈 배열 반환 (에러 없이)
        resolve([]);
      }
    });
  });
};

export const getPlaceDetails = async (placeId: string): Promise<any> => {
  const google = await loadGoogleMaps();
  const service = new google.maps.places.PlacesService(
    document.createElement('div')
  );

  return new Promise((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: [
          'name',
          'formatted_address',
          'geometry',
          'photos',
          'rating',
          'reviews',
          'opening_hours',
          'website',
          'formatted_phone_number',
        ],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error('Place details fetch failed'));
        }
      }
    );
  });
};

export const calculateRoute = async (
  destinations: Destination[],
  mode: TransportMode
): Promise<google.maps.DirectionsResult | null> => {
  if (destinations.length < 2) return null;

  await loadGoogleMaps();
  const directionsService = new google.maps.DirectionsService();

  const origin = { lat: destinations[0].lat, lng: destinations[0].lng };
  const destination = {
    lat: destinations[destinations.length - 1].lat,
    lng: destinations[destinations.length - 1].lng,
  };

  // TRANSIT 모드는 경유지를 지원하지 않음
  // WALKING과 BICYCLING도 경유지 제한이 있을 수 있음
  const supportsWaypoints = mode === 'DRIVING';
  
  const waypoints = (supportsWaypoints && destinations.length > 2)
    ? destinations.slice(1, -1).map((dest) => ({
        location: { lat: dest.lat, lng: dest.lng },
        stopover: true,
      }))
    : [];

  try {
    const result = await directionsService.route({
      origin,
      destination,
      waypoints,
      travelMode: google.maps.TravelMode[mode],
      optimizeWaypoints: waypoints.length > 0,
    });
    return result;
  } catch (error: any) {
    // 경로를 찾을 수 없음 - 조용히 null 반환
    return null;
  }
};

// 최적 경로 순서 계산
export const getOptimizedOrder = async (
  destinations: Destination[],
  mode: TransportMode
): Promise<Destination[] | null> => {
  if (destinations.length < 3) return null;

  try {
    const result = await calculateRoute(destinations, mode);
    if (!result || !result.routes[0].waypoint_order) return null;

    const waypointOrder = result.routes[0].waypoint_order;
    
    const optimized = [destinations[0]];
    
    waypointOrder.forEach(index => {
      optimized.push(destinations[index + 1]);
    });
    
    optimized.push(destinations[destinations.length - 1]);
    
    return optimized;
  } catch (error) {
    // 최적화 실패 시 조용히 null 반환
    return null;
  }
};

// 구간별 소요 시간 추출
export const getRouteDurations = (
  result: google.maps.DirectionsResult
): string[] => {
  const durations: string[] = [];
  const legs = result.routes[0].legs;
  
  legs.forEach(leg => {
    durations.push(leg.duration?.text || '알 수 없음');
  });
  
  return durations;
};

export const initMap = (
  mapElement: HTMLElement,
  center: { lat: number; lng: number }
): google.maps.Map | null => {
  if (!google) return null;

  return new google.maps.Map(mapElement, {
    center,
    zoom: 12,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  });
};

export const addMarkers = (
  map: google.maps.Map,
  destinations: Destination[]
): google.maps.Marker[] => {
  if (!google) return [];

  return destinations.map((dest, index) => {
    const marker = new google.maps.Marker({
      map,
      position: { lat: dest.lat, lng: dest.lng },
      label: {
        text: `${index + 1}`,
        color: 'white',
        fontWeight: 'bold',
      },
      title: dest.name,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${dest.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${dest.address}</p>
        </div>
      `,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    return marker;
  });
};

export const drawRoute = (
  map: google.maps.Map,
  directionsResult: google.maps.DirectionsResult
): google.maps.DirectionsRenderer => {
  if (!google) throw new Error('Google Maps not loaded');

  const directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: false,
    polylineOptions: {
      strokeColor: '#007AFF',
      strokeWeight: 4,
    },
  });

  directionsRenderer.setDirections(directionsResult);
  return directionsRenderer;
};