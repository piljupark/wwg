'use client';

import { useState } from 'react';
import { Search, MapPin, Star, Clock } from 'lucide-react';
import { searchPlaces, getPlaceDetails } from '@/lib/googleMaps';
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
      const places = await searchPlaces(searchQuery);
      setResults(places);
      setShowResults(places.length > 0);
    } catch (error) {
      // 에러 시 조용히 처리
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
      // 상세 정보 가져오기
      const details = await getPlaceDetails(place.place_id);

      const destination: Destination = {
        id: `dest-${Date.now()}`,
        name: place.name,
        address: place.formatted_address || '',
        placeId: place.place_id,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        rating: details.rating,
        photos: details.photos?.slice(0, 3).map((photo: any) =>
          photo.getUrl({ maxWidth: 400 })
        ),
      };

      addDestination(currentDayPlan.id, destination);
      setQuery('');
      setResults([]);
      setShowResults(false);
    } catch (error) {
      console.error('Failed to add destination:', error);
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
            results.map((place) => (
              <button
                key={place.place_id}
                onClick={() => handleSelectPlace(place)}
                className="w-full p-4 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors"
              >
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {place.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {place.formatted_address}
                  </div>
                  {place.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-gray-600">{place.rating}</span>
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