'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useTripStore } from '@/store/tripStore';
import { saveTripPlan, updateTripPlan, getTripPlan } from '@/lib/firestore';
import TripMap from '@/components/TripMap';
import DayTabs from '@/components/DayTabs';
import DestinationSearch from '@/components/DestinationSearch';
import DestinationList from '@/components/DestinationList';
import TransportSelector from '@/components/TransportSelector';
import { Menu, Plus, Share2, Save, LogOut, Check } from 'lucide-react';
import { TripPlan } from '@/types/trip';

export default function PlannerPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { currentTrip, setCurrentTrip } = useTripStore();

  // 사용자 인증 확인 및 여행 데이터 로드
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (!user) {
        router.push('/login');
      } else {
        // localStorage에서 마지막 tripId 확인
        const lastTripId = localStorage.getItem('lastTripId');
        
        if (lastTripId) {
          try {
            const trip = await getTripPlan(lastTripId);
            if (trip) {
              setCurrentTrip(trip);
              return;
            }
          } catch (error) {
            console.error('Failed to load trip:', error);
          }
        }
        
        // 기존 여행이 없으면 새로 생성
        if (!currentTrip) {
          const mockTrip: TripPlan = {
            id: '',
            userId: user.uid,
            title: '새 여행 계획',
            startDate: new Date(),
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            days: [
              {
                id: 'day-1',
                day: 1,
                destinations: [],
                transportMode: 'DRIVING',
              },
              {
                id: 'day-2',
                day: 2,
                destinations: [],
                transportMode: 'DRIVING',
              },
              {
                id: 'day-3',
                day: 3,
                destinations: [],
                transportMode: 'DRIVING',
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublic: false,
          };
          setCurrentTrip(mockTrip);
        }
      }
    });

    return () => unsubscribe();
  }, [router, setCurrentTrip]);

  // 자동 저장 (변경 감지) - 개선된 버전
  useEffect(() => {
    if (!currentTrip || !user || !currentTrip.id) return;

    const autoSave = async () => {
      try {
        // id를 제외한 데이터만 전송
        const { id, ...tripData } = currentTrip;
        await updateTripPlan(currentTrip.id, tripData);
      } catch (error) {
        // 자동 저장 실패는 조용히 처리
      }
    };

    // 2초 후 자동 저장 (디바운싱)
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [currentTrip, user]);

  // 수동 저장
  const handleSave = async () => {
    if (!currentTrip || !user) return;

    setSaving(true);
    try {
      if (currentTrip.id) {
        // 기존 여행 업데이트
        const { id, ...tripData } = currentTrip;
        await updateTripPlan(currentTrip.id, tripData);
      } else {
        // 새 여행 저장
        const newId = await saveTripPlan(user.uid, currentTrip);
        setCurrentTrip({ ...currentTrip, id: newId });
        localStorage.setItem('lastTripId', newId);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error: any) {
      console.error('Save failed:', error);
      alert(`저장 실패: ${error?.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!user || !currentTrip) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold">{currentTrip.title}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  saved 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    저장됨
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {saving ? '저장 중...' : '저장'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-120px)]">
          {/* 왼쪽: 지도 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <TripMap />
          </div>

          {/* 오른쪽: 일정 관리 */}
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Day 탭 */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <DayTabs />
            </div>

            {/* 검색 & 리스트 */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 overflow-hidden flex flex-col">
              <div className="mb-4">
                <DestinationSearch />
              </div>

              <div className="mb-4">
                <TransportSelector />
              </div>

              <div className="flex-1 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  목적지 ({currentTrip.days.find(d => d.day === 1)?.destinations.length || 0})
                </h3>
                <DestinationList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}