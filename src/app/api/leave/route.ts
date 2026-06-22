import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const approvedOnly = searchParams.get("approvedOnly") === "true";

    const roleHeader = req.headers.get("x-user-role");
    const userIdHeader = req.headers.get("x-user-id");

    let whereClause = {};

    if (approvedOnly) {
      whereClause = { status: "APPROVED" };
    } else {
      // staff can only view their own leave requests
      if (roleHeader === "EMPLOYEE") {
        whereClause = { userId: userIdHeader || "" };
      } 
      // managers can only see leave requests for staff in their same department
      else if (roleHeader === "MANAGER") {
        const manager = await prisma.user.findUnique({
          where: { id: userIdHeader || "" },
        });
        whereClause = {
          user: {
            department: manager?.department || "UNKNOWN_DEPT",
          },
        };
      }
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            department: true,
            position: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, leaveRequests });
  } catch (error: any) {
    console.error("GET leave requests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const roleHeader = req.headers.get("x-user-role");
    const userIdHeader = req.headers.get("x-user-id");

    // Only staff (EMPLOYEE) can file requests
    if (roleHeader !== "EMPLOYEE") {
      return NextResponse.json({ error: "Access Denied: Only staff (employees) can file leave requests." }, { status: 403 });
    }

    if (!userIdHeader) {
      return NextResponse.json({ error: "Missing authenticated user credentials." }, { status: 401 });
    }

    const { startDate, endDate, reason, durationType } = await req.json();

    if (!startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const newRequest = await prisma.leaveRequest.create({
      data: {
        userId: userIdHeader,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "PENDING",
        durationType: durationType || "FULL",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            department: true,
            position: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, leaveRequest: newRequest });
  } catch (error: any) {
    console.error("POST leave request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
