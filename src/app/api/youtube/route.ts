import { NextResponse } from "next/server";
import ytdl from '@distube/ytdl-core';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';


export async function GET(request: Request) {
    const parser = new XMLParser({parseAttributeValue: true,  attributeNamePrefix: "$",});
    const videoInfo = await ytdl.getInfo("https://www.youtube.com/watch?v=IMkqAUsVAfc");
    const captions = videoInfo.player_response.captions?.playerCaptionsTracklistRenderer.captionTracks;

    const captionUrl = captions?.[0].baseUrl;
    const resp = await fetch(captionUrl);
    const text = await resp.text();
    let jObj = parser.parse(text)

    console.log(jObj);
    return NextResponse.json({ captionUrl });
}