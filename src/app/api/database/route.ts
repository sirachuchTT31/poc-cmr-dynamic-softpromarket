import { NextResponse } from "next/server";
import axios from "axios";

const baseUrl = process.env.NEON_APP_URL;
const apiKey = process.env.NEON_API_KEY;
const projectKey = process.env.NEON_API_PROJECT_KEY;
const branchKey = process.env.NEON_API_BRANCH_KEY;

const url = `${baseUrl}/projects/${projectKey}/branches/${branchKey}/databases`;

export async function GET() {
  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return NextResponse.json({ success: true, data: res.data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    const payload = {
      database: {
        name,
        owner_name: "neondb_owner",
      },
    };

    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return NextResponse.json({ success: true, data: res.data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { oldName, name } = body;

    if (!oldName) {
      return NextResponse.json(
        { success: false, error: "Missing database oldName" },
        { status: 400 }
      );
    }

    const payload = {
      database: {
        name,
      },
    };

    const res = await axios.patch(`${url}/${oldName}`, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json({ success: true, data: res.data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Missing database oldName" },
        { status: 400 }
      );
    }

    const res = await axios.delete(`${url}/${name}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return NextResponse.json({ success: true, data: res.data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
