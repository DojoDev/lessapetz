import { NextResponse } from 'next/server';
import pool from '../../../../infra/database/pool';

export async function GET() {
  try {
    const res = await pool.query(
      `SELECT * FROM notifications_queue WHERE status = 'pending' ORDER BY created_at ASC`
    );
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
