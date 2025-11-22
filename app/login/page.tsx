'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { MapPin, Calendar } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('로그인 성공:', result.user);
      router.push('/planner');
    } catch (error: any) {
      console.error('로그인 실패:', error);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trip Planner
          </h1>
          <p className="text-gray-600">
            나만의 여행 일정을 계획하고 공유하세요
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="space-y-6">
            {/* 기능 소개 */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">지도로 계획하기</h3>
                  <p className="text-sm text-gray-600">
                    목적지를 추가하고 경로를 확인하세요
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">일정 관리</h3>
                  <p className="text-sm text-gray-600">
                    일차별로 여행 계획을 체계적으로 정리하세요
                  </p>
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200" />

            {/* 로그인 버튼 */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 rounded-xl px-6 py-4 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? '로그인 중...' : 'Google로 시작하기'}
            </button>

            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center mt-6 text-sm text-gray-500">
          로그인하면 서비스 약관 및 개인정보 보호정책에 동의하게 됩니다
        </div>
      </div>
    </div>
  );
}
