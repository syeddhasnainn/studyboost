import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const videoId = searchParams.get('videoId');

//   if (!videoId) {
//     return NextResponse.json(
//       { error: 'Video ID is required' },
//       { status: 400 }
//     );
//   }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript("kCc8FmEb1nY");
    return NextResponse.json({ transcript });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
} 