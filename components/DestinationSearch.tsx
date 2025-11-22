'use client';

import { useState } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import { searchNaverPlaces, geocodeAddress } from '@/lib/naverMaps';
import { useTripStore } from '@/store/tripStore';
import { Destination } from '@/types/trip';

export default function DestinationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { currentTrip, selectedDay, addDestination } = useTripStore();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const places = await searchNaverPlaces(searchQuery);
      setResults(places);
      setShowResults(places.length > 0);
    } catch (error) {
      setResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = async (place: any) => {
    if (!currentTrip) return;

    const currentDayPlan = currentTrip.days.find((day) => day.day === selectedDay);
    if (!currentDayPlan) return;

    try {
      // 주소로 좌표 가져오기
      const coords = await geocodeAddress(place.roadAddress || place.address);
      
      if (!coords) {
        alert('위치 정보를 가져올 수 없습니다.');
        return;
      }

      const destination: Destination = {
        id: `dest-${Date.now()}`,
        name: place.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
        address: place.roadAddress || place.address,
        lat: coords.lat,
        lng: coords.lng,
      };

      addDestination(currentDayPlan.id, destination);
      setQuery('');
      setResults([]);
      setShowResults(false);
    } catch (error) {
      console.error('Failed to add destination:', error);
      alert('목적지 추가에 실패했습니다.');
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="목적지 검색..."
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
          {results.length > 0 ? (
            results.map((place, index) => (
              <button
                key={index}
                onClick={() => handleSelectPlace(place)}
                className="w-full p-4 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors border-b border-gray-100 last:border-0"
              >
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div 
                    className="font-medium text-gray-900 truncate"
                    dangerouslySetInnerHTML={{ __html: place.title }}
                  />
                  <div className="text-sm text-gray-500 truncate mt-0.5">
                    {place.roadAddress || place.address}
                  </div>
                  {place.category && (
                    <div className="text-xs text-gray-400 mt-1">
                      {place.category}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      )}

      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg p-4 text-center text-gray-500">
          검색 중...
        </div>
      )}
    </div>
  );
}