import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Seed function if DB is empty - only seeds the Admin user now
export async function seedIfNeeded() {
  const count = await prisma.user.count();
  if (count === 0) {
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        username: "admin",
        password: hashedAdminPassword,
        role: "ADMIN",
        name: "System Administrator",
        department: "Operations",
        position: "Manager",
      },
    });
  }
}

export async function GET(req: Request) {
  try {
    await seedIfNeeded();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });
    
    // map password out
    const employees = users.map(user => {
      const { password, ...rest } = user;
      return rest;
    });

    return NextResponse.json({ success: true, employees });
  } catch (error: any) {
    console.error("GET employees error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const roleHeader = req.headers.get("x-user-role");
    
    // Only ADMIN can register employees
    if (roleHeader !== "ADMIN") {
      return NextResponse.json({ error: "Access Denied: Admin clearance required." }, { status: 403 });
    }

    const { name, department, position, username, password, role } = await req.json();

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username already exists in the registry." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        department,
        position,
        username,
        password: hashedPassword,
        role: role as any,
      },
    });

    const { password: _, ...employee } = newUser;
    return NextResponse.json({ success: true, employee });
  } catch (error: any) {
    console.error("POST employee error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
