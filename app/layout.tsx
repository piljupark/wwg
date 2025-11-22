import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trip Planner - 여행 일정 계획',
  description: '지도로 쉽게 여행 일정을 계획하고 공유하세요',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
