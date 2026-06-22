import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const roleHeader = req.headers.get("x-user-role");
    const userIdHeader = req.headers.get("x-user-id");

    // Only MANAGER can approve/reject
    if (roleHeader !== "MANAGER") {
      return NextResponse.json({ error: "Access Denied: Only managers can approve or reject leave requests." }, { status: 403 });
    }

    const { status } = await req.json();

    if (!status || (status !== "APPROVED" && status !== "REJECTED")) {
      return NextResponse.json({ error: "Invalid status parameter. Must be APPROVED or REJECTED." }, { status: 400 });
    }

    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Leave request not found." }, { status: 404 });
    }

    // Verify manager is in the same department as the staff member
    const manager = await prisma.user.findUnique({
      where: { id: userIdHeader || "" },
    });

    if (!manager || manager.department !== existingRequest.user.department) {
      return NextResponse.json({ error: "Access Denied: You can only approve or reject leave requests within your department." }, { status: 403 });
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: { status },
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

    return NextResponse.json({ success: true, leaveRequest: updatedRequest });
  } catch (error: any) {
    console.error("PATCH leave request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
