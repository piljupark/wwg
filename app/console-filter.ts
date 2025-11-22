// app/console-filter.ts
// 콘솔 경고 필터링

if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    
    // PlacesService deprecated 경고 무시
    if (message.includes('PlacesService') || 
        message.includes('places.js')) {
      return;
    }
    
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    
    // Directions ZERO_RESULTS 에러 무시
    if (message.includes('ZERO_RESULTS') || 
        message.includes('DIRECTIONS_ROUTE')) {
      return;
    }
    
    originalError.apply(console, args);
  };
}

export {};