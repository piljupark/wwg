'use client';

import { useEffect, useRef, useState } from 'react';
import { useTripStore } from '@/store/tripStore';
import {
  loadGoogleMaps,
  initMap,
  addMarkers,
  calculateRoute,
} from '@/lib/googleMaps';

export default function TripMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { currentTrip, selectedDay } = useTripStore();
  const [isLoading, setIsLoading] = useState(true);

  const currentDayPlan = currentTrip?.days.find((day) => day.day === selectedDay);
  const destinations = currentDayPlan?.destinations || [];

  // 지도 초기화
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        await loadGoogleMaps();
        const center = { lat: 37.5665, lng: 126.9780 };
        mapInstanceRef.current = initMap(mapRef.current, center);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, []);

  // 목적지 변경 시 마커와 경로 업데이트 (디바운싱)
  useEffect(() => {
    // 이전 타이머 취소
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // 500ms 후에 업데이트 (디바운싱)
    updateTimeoutRef.current = setTimeout(async () => {
      if (!mapInstanceRef.current) return;

      // 기존 마커 제거
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // 기존 경로 제거
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }

      if (destinations.length === 0) return;

      // 새 마커 추가
      const markers = addMarkers(mapInstanceRef.current, destinations);
      markersRef.current = markers;

      // 지도 범위 조정
      const bounds = new google.maps.LatLngBounds();
      destinations.forEach((dest) => {
        bounds.extend({ lat: dest.lat, lng: dest.lng });
      });
      mapInstanceRef.current.fitBounds(bounds);

      // 1개만 있으면 줌 조정
      if (destinations.length === 1) {
        setTimeout(() => {
          mapInstanceRef.current?.setZoom(14);
        }, 100);
        return;
      }

      // 2개 이상이면 경로 표시 시도
      if (destinations.length >= 2 && currentDayPlan?.transportMode) {
        const mode = currentDayPlan.transportMode;
        
        // DRIVING 모드는 모든 경유지 포함 가능
        if (mode === 'DRIVING') {
          try {
            const result = await calculateRoute(destinations, mode);
            
            if (result && mapInstanceRef.current) {
              const renderer = new google.maps.DirectionsRenderer({
                map: mapInstanceRef.current,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#4285F4',
                  strokeWeight: 6,
                  strokeOpacity: 0.7,
                },
              });
              
              renderer.setDirections(result);
              directionsRendererRef.current = renderer;

              if (result.routes[0]?.bounds) {
                mapInstanceRef.current.fitBounds(result.routes[0].bounds);
              }
            } else {
              // 실패 시 직선
              const path = destinations.map(dest => ({ lat: dest.lat, lng: dest.lng }));
              new google.maps.Polyline({
                path,
                map: mapInstanceRef.current,
                strokeColor: '#9CA3AF',
                strokeWeight: 3,
                strokeOpacity: 0.6,
                geodesic: true,
              });
            }
          } catch (error) {
            // 직선으로 표시
            if (mapInstanceRef.current) {
              const path = destinations.map(dest => ({ lat: dest.lat, lng: dest.lng }));
              new google.maps.Polyline({
                path,
                map: mapInstanceRef.current,
                strokeColor: '#9CA3AF',
                strokeWeight: 3,
                strokeOpacity: 0.6,
                geodesic: true,
              });
            }
          }
        } else {
          // TRANSIT, WALKING, BICYCLING: 구간별로 경로 그리기
          if (mapInstanceRef.current) {
            for (let i = 0; i < destinations.length - 1; i++) {
              try {
                const result = await calculateRoute(
                  [destinations[i], destinations[i + 1]], 
                  mode
                );
                
                if (result) {
                  const renderer = new google.maps.DirectionsRenderer({
                    map: mapInstanceRef.current,
                    suppressMarkers: true,
                    preserveViewport: true,
                    polylineOptions: {
                      strokeColor: mode === 'TRANSIT' ? '#34A853' : mode === 'WALKING' ? '#EA4335' : '#FBBC04',
                      strokeWeight: 5,
                      strokeOpacity: 0.7,
                    },
                  });
                  
                  renderer.setDirections(result);
                }
              } catch (error) {
                // 실패한 구간은 직선으로
                const path = [
                  { lat: destinations[i].lat, lng: destinations[i].lng },
                  { lat: destinations[i + 1].lat, lng: destinations[i + 1].lng }
                ];
                
                new google.maps.Polyline({
                  path,
                  map: mapInstanceRef.current!,
                  strokeColor: '#9CA3AF',
                  strokeWeight: 3,
                  strokeOpacity: 0.5,
                  geodesic: true,
                });
              }
            }
          }
        }
      }
    }, 500);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [destinations, currentDayPlan?.transportMode]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-gray-600">지도 로딩 중...</div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      
      {destinations.length === 0 && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center">
            <p className="text-gray-600">목적지를 추가해보세요</p>
          </div>
        </div>
      )}
    </div>
  );
}