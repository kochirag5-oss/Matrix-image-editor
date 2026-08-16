import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.REMOVEBG_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(
        { error: 'REMOVEBG_API_KEY is not configured. Add your key to .env.local' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Strip the data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: base64Data,
        size: 'auto',
        format: 'png',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('remove.bg API error:', response.status, errorData);
      
      const errorMessage =
        errorData?.errors?.[0]?.title ||
        errorData?.error ||
        `remove.bg API error (${response.status})`;

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Result = Buffer.from(imageBuffer).toString('base64');
    const resultDataUrl = `data:image/png;base64,${base64Result}`;

    return NextResponse.json({ image: resultDataUrl });
  } catch (error) {
    console.error('Remove BG route error:', error);
    return NextResponse.json(
      { error: 'Internal server error during background removal' },
      { status: 500 }
    );
  }
}
