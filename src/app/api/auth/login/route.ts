import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ADMIN_USERNAME, ADMIN_PASSWORD } from "@/constants";

async function seedIfNeeded() {
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

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // Seed admin if DB is empty
    await seedIfNeeded();

    // Fallback for hardcoded admin to prevent lockouts
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const adminInDb = await prisma.user.findUnique({
        where: { username: ADMIN_USERNAME },
      });
      return NextResponse.json({
        success: true,
        user: { 
          id: adminInDb ? adminInDb.id : "0", 
          username: ADMIN_USERNAME, 
          role: "ADMIN", 
          name: adminInDb ? adminInDb.name : "System Administrator",
          department: adminInDb ? adminInDb.department || "Operations" : "Operations"
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        name: user.name,
        department: user.department || undefined
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
