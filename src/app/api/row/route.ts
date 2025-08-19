import { NextResponse } from "next/server";
import { createSequelize } from "@/libs/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const databaseName = url.searchParams.get("databaseName");
  const tableName = url.searchParams.get("tableName");

  if (!databaseName || !tableName)
    return NextResponse.json(
      { success: false, error: "Missing databaseName or tableName" },
      { status: 400 }
    );

  const db = createSequelize(databaseName);

  try {
    const [rows] = await db.query(`SELECT * FROM "${tableName}"`);
    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  } finally {
    await db.close();
  }
}

export async function POST(req: Request) {
  const { databaseName, tableName, data } = await req.json();
  if (!databaseName || !tableName || !data)
    return NextResponse.json(
      { success: false, error: "Missing databaseName, tableName or data" },
      { status: 400 }
    );

  const db = createSequelize(databaseName);

  try {
    const columns = Object.keys(data)
      .map((c) => `"${c}"`)
      .join(", ");
    const values = Object.values(data)
      .map((v) => `'${v}'`)
      .join(", ");
    await db.query(
      `INSERT INTO "${tableName}" (${columns}) VALUES (${values})`
    );
    return NextResponse.json({ success: true, message: "Data inserted" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  } finally {
    await db.close();
  }
}

export async function PUT(req: Request) {
  const { databaseName, tableName, where, data } = await req.json();
  if (!databaseName || !tableName || !where || !data)
    return NextResponse.json(
      {
        success: false,
        error: "Missing databaseName, tableName, where or data",
      },
      { status: 400 }
    );

  const db = createSequelize(databaseName);

  try {
    const setStr = Object.entries(data)
      .map(([k, v]) => `"${k}"='${v}'`)
      .join(", ");
    const whereStr = Object.entries(where)
      .map(([k, v]) => `"${k}"='${v}'`)
      .join(" AND ");
    await db.query(`UPDATE "${tableName}" SET ${setStr} WHERE ${whereStr}`);
    return NextResponse.json({ success: true, message: "Data updated" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  } finally {
    await db.close();
  }
}

export async function DELETE(req: Request) {
  const { databaseName, tableName, where } = await req.json();
  if (!databaseName || !tableName || !where)
    return NextResponse.json(
      { success: false, error: "Missing databaseName, tableName or where" },
      { status: 400 }
    );

  const db = createSequelize(databaseName);

  try {
    const whereStr = Object.entries(where)
      .map(([k, v]) => `"${k}"='${v}'`)
      .join(" AND ");
    await db.query(`DELETE FROM "${tableName}" WHERE ${whereStr}`);
    return NextResponse.json({ success: true, message: "Data deleted" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  } finally {
    await db.close();
  }
}
