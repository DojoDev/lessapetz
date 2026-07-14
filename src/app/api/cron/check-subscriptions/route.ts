import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../infra/database/pool';

/**
 * GET /api/cron/check-subscriptions
 * 
 * Daily scheduled job (called by n8n, Vercel cron, or external scheduler).
 * Evaluates all active customer subscriptions and auto-queues admin alerts
 * for those in the "at-risk" window (75%+ of cycle elapsed, quota not fully used).
 * 
 * Also handles auto-renewal: if a plan has auto_renew=true and cycle has ended,
 * it resets the cycle and uses_consumed. Otherwise marks it expired.
 * 
 * Protected by a CRON_SECRET env var to prevent unauthorized calls.
 */
export async function GET(req: NextRequest) {
  try {
    // Auth: require CRON_SECRET header or query param
    const cronSecret = process.env.CRON_SECRET;
    const providedSecret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret');
    
    if (cronSecret && providedSecret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = { alertsCreated: 0, renewed: 0, expired: 0 };

    // 1. Find and expire/renew subscriptions past their cycle_end_date
    const expiredRes = await pool.query(`
      SELECT cp.*, c.full_name as client_name
      FROM customer_plans cp
      JOIN customers c ON c.id = cp.customer_id
      WHERE cp.status = 'active'
        AND cp.cycle_end_date < CURRENT_DATE
    `);

    for (const row of expiredRes.rows) {
      if (row.auto_renew) {
        // Auto-renew: reset the cycle
        const cycleDays = Math.round(
          (new Date(row.cycle_end_date).getTime() - new Date(row.cycle_start_date).getTime()) / (1000 * 3600 * 24)
        );
        const newStart = new Date(row.cycle_end_date);
        const newEnd = new Date(newStart.getTime() + cycleDays * 24 * 3600 * 1000);
        
        await pool.query(`
          UPDATE customer_plans 
          SET cycle_start_date = $1, cycle_end_date = $2, valid_until = $2, uses_consumed = 0
          WHERE id = $3
        `, [newStart, newEnd, row.id]);
        
        results.renewed++;
      } else {
        // Mark as expired
        await pool.query(
          `UPDATE customer_plans SET status = 'expired' WHERE id = $1`,
          [row.id]
        );
        
        // Queue an expiry notification
        await pool.query(`
          INSERT INTO notifications_queue (tenant_id, customer_id, subscription_id, type, message_payload)
          VALUES ($1, $2, $3, 'package_expired', $4)
          ON CONFLICT DO NOTHING
        `, [
          row.tenant_id, 
          row.customer_id, 
          row.id, 
          JSON.stringify({
            clientName: row.client_name,
            planName: row.plan_name,
            expirationDate: row.cycle_end_date,
          })
        ]);
        
        results.expired++;
      }
    }

    // 2. Find at-risk subscriptions (75%+ of cycle, quota not fully used)
    //    and queue admin alerts if not already queued
    const atRiskRes = await pool.query(`
      SELECT cp.*, c.full_name as client_name
      FROM customer_plans cp
      JOIN customers c ON c.id = cp.customer_id
      WHERE cp.status = 'active'
        AND cp.total_quota > cp.uses_consumed
        AND cp.cycle_end_date >= CURRENT_DATE
        AND CURRENT_DATE > (cp.cycle_start_date + ((cp.cycle_end_date - cp.cycle_start_date) * 0.75)::integer)
        AND NOT EXISTS (
          SELECT 1 FROM notifications_queue nq 
          WHERE nq.subscription_id = cp.id 
            AND nq.type = 'package_ending' 
            AND nq.status = 'pending'
        )
    `);

    for (const row of atRiskRes.rows) {
      await pool.query(`
        INSERT INTO notifications_queue (tenant_id, customer_id, subscription_id, type, message_payload, status)
        VALUES ($1, $2, $3, 'package_ending', $4, 'pending')
      `, [
        row.tenant_id,
        row.customer_id,
        row.id,
        JSON.stringify({
          clientName: row.client_name,
          planName: row.plan_name,
          usesConsumed: row.uses_consumed,
          totalQuota: row.total_quota,
          usesLeft: row.total_quota - row.uses_consumed,
          expirationDate: row.cycle_end_date,
        })
      ]);
      results.alertsCreated++;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
