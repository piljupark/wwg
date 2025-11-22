import { NextRequest, NextResponse } from 'next/server';

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'address parameter is required' },
      { status: 400 }
    );
  }

  try {
    // ✅ 올바른 엔드포인트: maps.apigw.ntruss.com
    const url = new URL('https://maps.apigw.ntruss.com/map-geocode/v2/geocode');
    url.searchParams.set('query', address);

    const response = await fetch(url.toString(), {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID || '',
        'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET || '',
      },
    });

    if (!response.ok) {
      throw new Error('Naver Geocoding API request failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    );
  }
}