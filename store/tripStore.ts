import { create } from 'zustand';
import { TripPlan, DayPlan, Destination } from '@/types/trip';

interface TripStore {
  currentTrip: TripPlan | null;
  selectedDay: number;
  setCurrentTrip: (trip: TripPlan | null) => void;
  setSelectedDay: (day: number) => void;
  addDestination: (dayId: string, destination: Destination) => void;
  removeDestination: (dayId: string, destinationId: string) => void;
  updateDestination: (dayId: string, destinationId: string, updates: Partial<Destination>) => void;
  reorderDestinations: (dayId: string, destinations: Destination[]) => void;
  updateDayPlan: (dayId: string, updates: Partial<DayPlan>) => void;
  addDay: () => void;
  removeDay: (dayId: string) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  currentTrip: null,
  selectedDay: 1,
  
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  
  setSelectedDay: (day) => set({ selectedDay: day }),
  
  addDestination: (dayId, destination) =>
    set((state) => {
      if (!state.currentTrip) return state;
      
      const updatedDays = state.currentTrip.days.map((day) =>
        day.id === dayId
          ? { ...day, destinations: [...day.destinations, destination] }
          : day
      );
      
      return {
        currentTrip: { ...state.currentTrip, days: updatedDays },
      };
    }),
  
  removeDestination: (dayId, destinationId) =>
    set((state) => {
      if (!state.currentTrip) return state;
      
      const updatedDays = state.currentTrip.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              destinations: day.destinations.filter((d) => d.id !== destinationId),
            }
          : day
      );
      
      return {
        currentTrip: { ...state.currentTrip, days: updatedDays },
      };
    }),
  
  updateDestination: (dayId, destinationId, updates) =>
    set((state) => {
      if (!state.currentTrip) return state;
      
      const updatedDays = state.currentTrip.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              destinations: day.destinations.map((d) =>
                d.id === destinationId ? { ...d, ...updates } : d
              ),
            }
          : day
      );
      
      return {
        currentTrip: { ...state.currentTrip, days: updatedDays },
      };
    }),
  
  reorderDestinations: (dayId, destinations) =>
    set((state) => {
      if (!state.currentTrip) return state;
      
      const updatedDays = state.currentTrip.days.map((day) =>
        day.id === dayId ? { ...day, destinations } : day
      );
      
      return {
        currentTrip: { ...state.currentTrip, days: updatedDays },
      };
    }),
  
  updateDayPlan: (dayId, updates) =>
    set((state) => {
      if (!state.currentTrip) return state;
      
      const updatedDays = state.currentTrip.days.map((day) =>
        day.id === dayId ? { ...day, ...updates } : day
      );
      
      return {
        currentTrip: { ...state.currentTrip, days: updatedDays },
      };
    }),
  
  addDay: () =>
    set((state) => {
      if (!state.currentTrip) return state;
      
      const newDayNumber = state.currentTrip.days.length + 1;
      const newDay: DayPlan = {
        id: `day-${Date.now()}`,
        day: newDayNumber,
        date: new Date(
          state.currentTrip.startDate.getTime() + (newDayNumber - 1) * 24 * 60 * 60 * 1000
        ),
        destinations: [],
        transportMode: 'DRIVING',
      };
      
      return {
        currentTrip: {
          ...state.currentTrip,
          days: [...state.currentTrip.days, newDay],
        },
      };
    }),
  
  removeDay: (dayId) =>
    set((state) => {
      if (!state.currentTrip) return state;
      if (state.currentTrip.days.length <= 1) return state;
      
      const updatedDays = state.currentTrip.days
        .filter((day) => day.id !== dayId)
        .map((day, index) => ({
          ...day,
          day: index + 1,
        }));
      
      return {
        currentTrip: { ...state.currentTrip, days: updatedDays },
        selectedDay: Math.min(state.selectedDay, updatedDays.length),
      };
    }),
}));