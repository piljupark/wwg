import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { TripPlan } from '@/types/trip';

const TRIPS_COLLECTION = 'trips';

// 여행 계획 저장
export const saveTripPlan = async (
  userId: string,
  tripPlan: Omit<TripPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const tripRef = doc(collection(db, TRIPS_COLLECTION));
  
  const tripData: TripPlan = {
    ...tripPlan,
    id: tripRef.id,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(tripRef, {
    ...tripData,
    startDate: Timestamp.fromDate(tripData.startDate),
    endDate: Timestamp.fromDate(tripData.endDate),
    createdAt: Timestamp.fromDate(tripData.createdAt),
    updatedAt: Timestamp.fromDate(tripData.updatedAt),
  });

  return tripRef.id;
};

// 여행 계획 업데이트
export const updateTripPlan = async (
  tripId: string,
  updates: Partial<TripPlan>
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  
  // id, userId 필드는 제외 (변경 불가)
  const { id, userId, ...data } = updates as any;
  
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  // Date 객체를 Timestamp로 변환
  if (updates.startDate) {
    updateData.startDate = Timestamp.fromDate(updates.startDate);
  }
  if (updates.endDate) {
    updateData.endDate = Timestamp.fromDate(updates.endDate);
  }
  if (updates.createdAt) {
    updateData.createdAt = Timestamp.fromDate(updates.createdAt);
  }

  // days 배열의 date 필드도 변환
  if (updates.days) {
    updateData.days = updates.days.map(day => ({
      ...day,
      date: day.date ? Timestamp.fromDate(day.date) : null,
    }));
  }

  await updateDoc(tripRef, updateData);
};

// 여행 계획 가져오기
export const getTripPlan = async (tripId: string): Promise<TripPlan | null> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  const tripSnap = await getDoc(tripRef);

  if (!tripSnap.exists()) return null;

  const data = tripSnap.data();
  return {
    ...data,
    id: tripSnap.id,
    startDate: data.startDate.toDate(),
    endDate: data.endDate.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    days: data.days.map((day: any) => ({
      ...day,
      date: day.date ? day.date.toDate() : null,
    })),
  } as TripPlan;
};

// 사용자의 모든 여행 계획 가져오기
export const getUserTripPlans = async (userId: string): Promise<TripPlan[]> => {
  const tripsQuery = query(
    collection(db, TRIPS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(tripsQuery);
  
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      days: data.days.map((day: any) => ({
        ...day,
        date: day.date ? day.date.toDate() : null,
      })),
    } as TripPlan;
  });
};

// 공유된 여행 계획 가져오기
export const getSharedTripPlans = async (userId: string): Promise<TripPlan[]> => {
  const tripsQuery = query(
    collection(db, TRIPS_COLLECTION),
    where('sharedWith', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(tripsQuery);
  
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      days: data.days.map((day: any) => ({
        ...day,
        date: day.date ? day.date.toDate() : null,
      })),
    } as TripPlan;
  });
};

// 여행 계획 삭제
export const deleteTripPlan = async (tripId: string): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  await deleteDoc(tripRef);
};

// 여행 계획 공유
export const shareTripPlan = async (
  tripId: string,
  userIds: string[]
): Promise<void> => {
  const tripRef = doc(db, TRIPS_COLLECTION, tripId);
  await updateDoc(tripRef, {
    sharedWith: userIds,
    updatedAt: Timestamp.now(),
  });
};

// 공개 여행 계획 검색
export const getPublicTripPlans = async (): Promise<TripPlan[]> => {
  const tripsQuery = query(
    collection(db, TRIPS_COLLECTION),
    where('isPublic', '==', true),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(tripsQuery);
  
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      days: data.days.map((day: any) => ({
        ...day,
        date: day.date ? day.date.toDate() : null,
      })),
    } as TripPlan;
  });
};