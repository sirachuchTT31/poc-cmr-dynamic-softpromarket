import { NextResponse } from "next/server";
import { createSequelize } from "@/libs/db";

export async function GET(req: Request) {
  const databaseName = new URL(req.url).searchParams.get("databaseName");
  const tableName = new URL(req.url).searchParams.get("tableName");

  if (!databaseName || !tableName)
    return NextResponse.json(
      { success: false, error: "Missing databaseName or tableName" },
      { status: 400 }
    );

  const db = createSequelize(databaseName);

  try {
    const [columns] = await db.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = '${tableName}' AND table_schema = 'public';
    `);

    return NextResponse.json({
      success: true,
      data: columns,
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
  const { databaseName, tableName, columnName, columnType } = await req.json();

  if (!databaseName || !tableName || !columnName || !columnType) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing databaseName, tableName, columnName or columnType",
      },
      { status: 400 }
    );
  }

  const db = createSequelize(databaseName);

  try {
    await db.query(
      `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${columnType};`
    );
    return NextResponse.json({
      success: true,
      message: `Column ${columnName} added to ${tableName}`,
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
  const { databaseName, tableName, oldName, newName, newType } =
    await req.json();

  if (!databaseName || !tableName || !oldName) {
    return NextResponse.json(
      { success: false, error: "Missing databaseName, tableName or oldName" },
      { status: 400 }
    );
  }

  const db = createSequelize(databaseName);

  try {
    if (newName) {
      await db.query(
        `ALTER TABLE "${tableName}" RENAME COLUMN "${oldName}" TO "${newName}";`
      );
    }

    if (newType) {
      let using = "";
      if (newType === "INTEGER" || newType === "BIGINT") {
        using = `USING "${newName || oldName}"::${newType.toLowerCase()}`;
      }
      await db.query(
        `ALTER TABLE "${tableName}" ALTER COLUMN "${
          newName || oldName
        }" TYPE ${newType} ${using};`
      );
    }

    return NextResponse.json({
      success: true,
      message: `Column ${oldName} updated in ${tableName}`,
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
  const { databaseName, tableName, columnName } = await req.json();

  if (!databaseName || !tableName || !columnName) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing databaseName, tableName or columnName",
      },
      { status: 400 }
    );
  }

  const db = createSequelize(databaseName);

  try {
    await db.query(
      `ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${columnName}";`
    );
    return NextResponse.json({
      success: true,
      message: `Column ${columnName} deleted from ${tableName}`,
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
