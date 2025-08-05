// app/api/vdocipher/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const videoId = '81b0e4499e1441fdaaad8ce1909e2cf9'
  const secret = process.env.VDOCIPHER_SECRET

  const response = await fetch(
    `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
    {
      method: 'POST',
      headers: {
        Authorization: `Apisecret ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ttl: 300 }),
    }
  )

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch OTP' }, { status: 500 })
  }

  const data = await response.json()
  return NextResponse.json(data)
}
