import { NextResponse } from "next/server";
import { createSequelize } from "@/libs/db";

export async function GET(req: Request) {
  const databaseName = new URL(req.url).searchParams.get("databaseName");
  if (!databaseName)
    return NextResponse.json(
      { success: false, error: "Missing databaseName" },
      { status: 400 }
    );

  const db = createSequelize(databaseName);

  try {
    const [tables] = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    return NextResponse.json({
      success: true,
      data: tables.map((t: any) => t.table_name),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await db.close();
  }
}

export async function POST(req: Request) {
  const { databaseName, tableName } = await req.json();

  if (!databaseName || !tableName) {
    return NextResponse.json(
      { success: false, error: "Missing databaseName or tableName" },
      { status: 400 }
    );
  }

  const db = createSequelize(databaseName);

  try {
    await db.query(`
      CREATE TABLE "${tableName}" (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    return NextResponse.json({
      success: true,
      message: `Table ${tableName} created`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await db.close();
  }
}

export async function PUT(req: Request) {
  const { databaseName, oldName, newName } = await req.json();

  if (!databaseName || !oldName || !newName) {
    return NextResponse.json(
      { success: false, error: "Missing databaseName, oldName or newName" },
      { status: 400 }
    );
  }

  const db = createSequelize(databaseName);

  try {
    await db.query(`ALTER TABLE "${oldName}" RENAME TO "${newName}";`);
    return NextResponse.json({
      success: true,
      message: `Renamed ${oldName} to ${newName}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await db.close();
  }
}

export async function DELETE(req: Request) {
  const { databaseName, tableName } = await req.json();

  if (!databaseName || !tableName) {
    return NextResponse.json(
      { success: false, error: "Missing databaseName or tableName" },
      { status: 400 }
    );
  }

  const db = createSequelize(databaseName);

  try {
    await db.query(`DROP TABLE IF EXISTS "${tableName}";`);
    return NextResponse.json({
      success: true,
      message: `Table ${tableName} deleted`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await db.close();
  }
}
