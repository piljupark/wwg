'use client';

import { useEffect, useRef, useState } from 'react';
import { useTripStore } from '@/store/tripStore';
import {
  loadNaverMaps,
  initNaverMap,
  addNaverMarkers,
  drawNaverRoute,
} from '@/lib/naverMaps';

export default function TripMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
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
        await loadNaverMaps();
        const center = { lat: 37.5665, lng: 126.9780 }; // 서울 중심
        mapInstanceRef.current = initNaverMap(mapRef.current, center);
        setIsLoading(false);
      } catch (error) {
        console.error('Map initialization failed:', error);
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
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }

      if (destinations.length === 0) return;

      // 새 마커 추가
      const markers = addNaverMarkers(mapInstanceRef.current, destinations);
      markersRef.current = markers;

      // 지도 범위 조정
      const bounds = new naver.maps.LatLngBounds();
      destinations.forEach((dest) => {
        bounds.extend(new naver.maps.LatLng(dest.lat, dest.lng));
      });
      mapInstanceRef.current.fitBounds(bounds);

      // 1개만 있으면 줌 조정
      if (destinations.length === 1) {
        setTimeout(() => {
          mapInstanceRef.current?.setZoom(14);
        }, 100);
        return;
      }

      // 2개 이상이면 경로 표시
      if (destinations.length >= 2 && currentDayPlan?.transportMode) {
        const polyline = await drawNaverRoute(
          mapInstanceRef.current,
          destinations,
          currentDayPlan.transportMode
        );
        
        if (polyline) {
          polylineRef.current = polyline;
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