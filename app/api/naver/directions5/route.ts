import { NextRequest, NextResponse } from 'next/server';

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const goal = searchParams.get('goal');
  const waypoints = searchParams.get('waypoints');

  if (!start || !goal) {
    return NextResponse.json(
      { error: 'start and goal parameters are required' },
      { status: 400 }
    );
  }

  try {
    // ✅ 올바른 엔드포인트: maps.apigw.ntruss.com
    const url = new URL('https://maps.apigw.ntruss.com/map-direction/v1/driving');
    url.searchParams.set('start', start);
    url.searchParams.set('goal', goal);
    if (waypoints) {
      url.searchParams.set('waypoints', waypoints);
    }
    url.searchParams.set('option', 'traoptimal');

    console.log('🔍 Directions API 호출:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID || '',
        'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET || '',
      },
    });

    console.log('📡 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Directions API 에러:', errorText);
      throw new Error(`Naver API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Directions API 성공');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Directions API error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch directions', details: error.message },
      { status: 500 }
    );
  }
}