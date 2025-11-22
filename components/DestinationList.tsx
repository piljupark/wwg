'use client';

import { useState, useEffect } from 'react';
import { useTripStore } from '@/store/tripStore';
import { MapPin, X, GripVertical, Star, Navigation, Zap, Clock } from 'lucide-react';
import { Destination } from '@/types/trip';
import { getOptimizedNaverRoute, getNaverRouteDurations } from '@/lib/naverMaps';

export default function DestinationList() {
  const { currentTrip, selectedDay, removeDestination, reorderDestinations } = useTripStore();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [durations, setDurations] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const currentDayPlan = currentTrip?.days.find((day) => day.day === selectedDay);
  const destinations = currentDayPlan?.destinations || [];

  // 경로 소요시간 업데이트
  useEffect(() => {
    const updateDurations = async () => {
      if (destinations.length < 2 || !currentDayPlan?.transportMode) {
        setDurations([]);
        return;
      }

      const times = await getNaverRouteDurations(destinations, currentDayPlan.transportMode);
      setDurations(times);
    };

    updateDurations();
  }, [destinations, currentDayPlan?.transportMode]);

  const handleOptimize = async () => {
    if (!currentDayPlan || destinations.length < 3) return;

    setIsOptimizing(true);
    try {
      const optimized = await getOptimizedNaverRoute(
        destinations,
        currentDayPlan.transportMode
      );
      
      if (optimized) {
        reorderDestinations(currentDayPlan.id, optimized);
      } else {
        alert('경로 최적화에 실패했습니다.');
      }
    } catch (error) {
      alert('경로 최적화 중 오류가 발생했습니다.');
    } finally {
      setIsOptimizing(false);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex || !currentDayPlan) return;

    const newDestinations = [...destinations];
    const [removed] = newDestinations.splice(draggedIndex, 1);
    newDestinations.splice(dropIndex, 0, removed);

    reorderDestinations(currentDayPlan.id, newDestinations);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (destinations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>아직 추가된 목적지가 없습니다</p>
      </div>
    );
  }

  const handleRemove = (destinationId: string) => {
    if (!currentDayPlan) return;
    removeDestination(currentDayPlan.id, destinationId);
  };

  const transportModeLabel = {
    DRIVING: '자동차',
    TRANSIT: '대중교통',
    WALKING: '도보',
    BICYCLING: '자전거',
  };

  return (
    <div className="space-y-3">
      {/* 최적 경로 버튼 */}
      {destinations.length >= 3 && (
        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          {isOptimizing ? '최적화 중...' : '최적 경로 자동 정렬'}
        </button>
      )}

      {destinations.map((destination, index) => (
        <div key={destination.id}>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-move ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* 드래그 핸들 */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <GripVertical className="w-5 h-5 text-gray-400" />
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {destination.name}
                </h3>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {destination.address}
                </p>

                {destination.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {destination.rating}
                    </span>
                  </div>
                )}

                {destination.photos && destination.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {destination.photos.map((photo, photoIndex) => (
                      <img
                        key={photoIndex}
                        src={photo}
                        alt={`${destination.name} ${photoIndex + 1}`}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleRemove(destination.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 소요 시간 표시 */}
          {index < destinations.length - 1 && durations[index] && (
            <div className="flex items-center gap-2 py-2 px-4 text-sm text-gray-500">
              <Navigation className="w-4 h-4" />
              <span className="font-medium">
                {transportModeLabel[currentDayPlan?.transportMode || 'DRIVING']}
              </span>
              <Clock className="w-4 h-4 ml-2 text-blue-500" />
              <span className="font-semibold text-blue-600">{durations[index]}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}