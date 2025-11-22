'use client';

import { useState } from 'react';
import { useTripStore } from '@/store/tripStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Plus, X } from 'lucide-react';

export default function DayTabs() {
  const { currentTrip, selectedDay, setSelectedDay, updateDayPlan, addDay, removeDay } = useTripStore();
  const [editingDay, setEditingDay] = useState<number | null>(null);

  if (!currentTrip) return null;

  const handleDateChange = (dayId: string, newDate: string) => {
    updateDayPlan(dayId, { date: new Date(newDate) });
    setEditingDay(null);
  };

  const handleRemoveDay = (e: React.MouseEvent, dayId: string) => {
    e.stopPropagation();
    if (currentTrip.days.length > 1 && confirm('이 일정을 삭제하시겠습니까?')) {
      removeDay(dayId);
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {currentTrip.days.map((day) => {
        const isSelected = day.day === selectedDay;
        const isEditing = editingDay === day.day;
        const date = day.date || new Date(
          currentTrip.startDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000
        );

        return (
          <div key={day.id} className="relative flex-shrink-0 group">
            {/* 삭제 버튼 - 독립적으로 배치 */}
            {currentTrip.days.length > 1 && (
              <div
                onClick={(e) => handleRemoveDay(e, day.id)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
              >
                <X className="w-3 h-3" />
              </div>
            )}

            {/* Day 버튼 */}
            <div
              onClick={() => setSelectedDay(day.day)}
              onDoubleClick={() => setEditingDay(day.day)}
              className={`
                px-6 py-3 rounded-xl font-medium transition-all cursor-pointer
                ${isSelected
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <div className="text-sm font-semibold flex items-center gap-1">
                Day {day.day}
                <Calendar className="w-3 h-3 opacity-50" />
              </div>
              <div className="text-xs opacity-80 mt-0.5">
                {format(date, 'M월 d일 (E)', { locale: ko })}
              </div>
            </div>

            {/* 날짜 변경 입력창 */}
            {isEditing && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl p-3 z-50 min-w-[200px]">
                <div className="text-xs text-gray-600 mb-2">날짜 변경</div>
                <input
                  type="date"
                  defaultValue={format(date, 'yyyy-MM-dd')}
                  onChange={(e) => handleDateChange(day.id, e.target.value)}
                  onBlur={() => setEditingDay(null)}
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Day 추가 버튼 */}
      <div
        onClick={addDay}
        className="flex-shrink-0 w-12 h-[72px] rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all flex items-center justify-center cursor-pointer group"
        title="일정 추가"
      >
        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </div>
    </div>
  );
}