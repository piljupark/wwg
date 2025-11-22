'use client';

import { useTripStore } from '@/store/tripStore';
import { Car, Train, Footprints, Bike } from 'lucide-react';
import { TransportMode } from '@/types/trip';

const TRANSPORT_MODES = [
  { mode: 'DRIVING' as TransportMode, icon: Car, label: '자동차' },
  { mode: 'TRANSIT' as TransportMode, icon: Train, label: '대중교통' },
  { mode: 'WALKING' as TransportMode, icon: Footprints, label: '도보' },
  { mode: 'BICYCLING' as TransportMode, icon: Bike, label: '자전거' },
];

export default function TransportSelector() {
  const { currentTrip, selectedDay, updateDayPlan } = useTripStore();

  const currentDayPlan = currentTrip?.days.find((day) => day.day === selectedDay);
  const currentMode = currentDayPlan?.transportMode || 'DRIVING';

  const handleModeChange = (mode: TransportMode) => {
    if (!currentDayPlan) return;
    updateDayPlan(currentDayPlan.id, { transportMode: mode });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">이동수단</h3>
      <div className="grid grid-cols-4 gap-2">
        {TRANSPORT_MODES.map(({ mode, icon: Icon, label }) => {
          const isSelected = currentMode === mode;
          
          return (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-xl transition-all
                ${isSelected
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
