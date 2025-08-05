// app/api/vdo/otp/[videoId]/route.ts
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  context: { params: Promise<{ videoId: string }> }
) {
  try {
    // Await the params promise to satisfy the generated type
    const { videoId } = await context.params

    console.log('Requesting OTP for video ID:', videoId)

    const secret = process.env.VDOCIPHER_API_SECRET
    if (!secret) {
      console.error('Missing VDOCIPHER_API_SECRET environment variable')
      return NextResponse.json(
        { error: "VdoCipher API secret not configured" },
        { status: 500 }
      )
    }

    // Validate video ID format
    if (!videoId || videoId.trim() === '') {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      )
    }

    // Step 1: request OTP + playbackInfo
    const vdoCipherUrl = `https://dev.vdocipher.com/api/videos/${videoId}/otp`
    console.log('Making request to:', vdoCipherUrl)

    const resp = await fetch(vdoCipherUrl, {
      method: "POST",
      headers: {
        Authorization: `Apisecret ${secret}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ ttl: 300 }),
    })

    console.log('VdoCipher API response status:', resp.status)

    const responseText = await resp.text()
    console.log('VdoCipher API response body:', responseText)

    if (!resp.ok) {
      console.error("VdoCipher OTP error:", resp.status, responseText)
      
      let errorMessage = `VdoCipher API error (${resp.status})`
      try {
        const errorJson = JSON.parse(responseText)
        if (errorJson.message) {
          errorMessage = errorJson.message
        } else if (errorJson.error) {
          errorMessage = errorJson.error
        }
      } catch (e) {
        errorMessage = responseText || errorMessage
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: resp.status }
      )
    }

    let json
    try {
      json = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse VdoCipher response as JSON:', responseText)
      return NextResponse.json(
        { error: "Invalid response from VdoCipher API" },
        { status: 502 }
      )
    }

    console.log('Parsed VdoCipher response:', json)

    const { otp, playbackInfo } = json
    if (!otp || !playbackInfo) {
      console.error("Malformed VdoCipher response - missing otp or playbackInfo:", json)
      return NextResponse.json(
        { error: "Malformed response from VdoCipher API: missing otp or playbackInfo" },
        { status: 502 }
      )
    }

    console.log('Successfully generated OTP for video:', videoId)
    return NextResponse.json({ otp, playbackInfo })

  } catch (error) {
    console.error('Unexpected error in OTP API route:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}