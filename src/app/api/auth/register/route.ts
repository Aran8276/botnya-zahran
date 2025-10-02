import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { GuestRegisterSchema, UserRegisterSchema } from "@/lib/schemas";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userRegisterValidation = UserRegisterSchema.safeParse(body);
    if (userRegisterValidation.success) {
      const { username, password, name, serializedId } =
        userRegisterValidation.data;

      const existingGuest = await prisma.user.findFirst({
        where: {
          serializedId,
          role: Role.AWAIT_REGISTER,
        },
      });

      if (!existingGuest) {
        return NextResponse.json(
          {
            error:
              "A guest account with this identifier does not exist. Please register as a guest first.",
          },
          { status: 404 }
        );
      }

      const usernameTaken = await prisma.user.findUnique({
        where: { username },
      });
      if (usernameTaken && usernameTaken.id !== existingGuest.id) {
        return NextResponse.json(
          { error: "Username is already taken." },
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { id: existingGuest.id },
        data: {
          username,
          password: hashedPassword,
          name: name || null,
          role: Role.USER,
        },
      });

      return NextResponse.json(
        { message: "User registered successfully" },
        { status: 201 }
      );
    }

    const guestRegisterValidation = GuestRegisterSchema.safeParse(body);
    if (guestRegisterValidation.success) {
      const { serializedId } = guestRegisterValidation.data;

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username: serializedId }, { serializedId: serializedId }],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Identifier already taken" },
          { status: 409 }
        );
      }

      await prisma.user.create({
        data: {
          serializedId,
          role: Role.AWAIT_REGISTER,
        },
      });

      return NextResponse.json(
        { message: "Guest registered successfully" },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Invalid fields!" }, { status: 400 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
