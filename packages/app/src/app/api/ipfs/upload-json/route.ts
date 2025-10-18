import { NextRequest, NextResponse } from "next/server";

import { pinata } from "@/utils/config";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const { cid } = await pinata.upload.public.json(data);
    const url = await pinata.gateways.public.convert(cid);

    return NextResponse.json(url, { status: 200 });
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
