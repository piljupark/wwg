import { NextRequest, NextResponse } from 'next/server';

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const url = new URL('https://openapi.naver.com/v1/search/local.json');
    url.searchParams.set('query', query);
    url.searchParams.set('display', '10');

    const response = await fetch(url.toString(), {
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID || '',
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET || '',
      },
    });

    if (!response.ok) {
      throw new Error('Naver Search API request failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    );
  }
}