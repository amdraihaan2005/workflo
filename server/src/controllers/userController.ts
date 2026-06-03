import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        cognitoId: String(cognitoId),
      },
    });

    res.json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user: ${error.message}` });
  }
};

export const postUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      username,
      cognitoId,
      profilePictureUrl = "i1.jpg",
      teamId = 1,
    } = req.body;

    // Check if user with this cognitoId already exists
    let user = await prisma.user.findUnique({
      where: { cognitoId },
    });

    if (user) {
      res.status(200).json(user);
      return;
    }

    // Check if user with this username already exists (for sandbox linking)
    user = await prisma.user.findUnique({
      where: { username },
    });

    if (user) {
      // Update the existing user's cognitoId to link them
      const updatedUser = await prisma.user.update({
        where: { userId: user.userId },
        data: { cognitoId },
      });
      res.status(200).json(updatedUser);
      return;
    }

    // Otherwise, create a new user
    const newUser = await prisma.user.create({
      data: {
        username,
        cognitoId,
        profilePictureUrl,
        teamId,
      },
    });
    res.status(201).json(newUser);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating user: ${error.message}` });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;
  const { username, profilePictureUrl, teamId } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: {
        cognitoId: String(cognitoId),
      },
      data: {
        username,
        profilePictureUrl,
        teamId: teamId ? Number(teamId) : null,
      },
    });
    res.json(updatedUser);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "Username is already taken." });
      return;
    }
    res
      .status(500)
      .json({ message: `Error updating user: ${error.message}` });
  }
};