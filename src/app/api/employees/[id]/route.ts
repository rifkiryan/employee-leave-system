import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    const { password, ...employee } = user;
    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    console.error("GET employee by ID error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const roleHeader = req.headers.get("x-user-role");

    // Only ADMIN can update employees
    if (roleHeader !== "ADMIN") {
      return NextResponse.json({ error: "Access Denied: Admin clearance required." }, { status: 403 });
    }

    const { name, department, position, username, password, role } = await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    // Check username uniqueness if changed
    if (username && username !== existingUser.username) {
      const usernameConflict = await prisma.user.findUnique({
        where: { username },
      });
      if (usernameConflict) {
        return NextResponse.json({ error: "Username already exists." }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (department !== undefined) updateData.department = department;
    if (position !== undefined) updateData.position = position;
    if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role as any;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...employee } = updatedUser;
    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    console.error("PATCH employee error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const roleHeader = req.headers.get("x-user-role");

    // Only ADMIN can delete employees
    if (roleHeader !== "ADMIN") {
      return NextResponse.json({ error: "Access Denied: Admin clearance required." }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }

    // Prevent deleting the currently logged-in admin if they are deleting themselves
    const userIdHeader = req.headers.get("x-user-id");
    if (userIdHeader === id) {
      return NextResponse.json({ error: "Cannot delete your own admin account." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE employee error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
