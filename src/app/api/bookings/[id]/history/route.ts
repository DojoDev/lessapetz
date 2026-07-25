import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/infra/auth/jwt";
import { PostgresBookingRepository } from "@/infra/repositories/PostgresBookingRepository";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Auth & Tenant validation
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
    const token = cookieStore.get(cookieName)?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    const payload = await verifyJwt(token);
    if (!payload || !payload.sub || !payload.tenantId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    const tenantId = payload.tenantId;

    const bookingRepo = new PostgresBookingRepository();
    const history = await bookingRepo.getStatusHistory(tenantId, id);

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    console.error("Error fetching booking history:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
