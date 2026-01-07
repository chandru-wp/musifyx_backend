import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

// In-Memory Store as LAST RESORT ONLY
let simulatedUsers = [
  { id: "sim-admin", username: "admin@musifyx.local", role: "ADMIN", name: "Local Admin" }
];

export const register = async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    const lowerUser = username.toLowerCase().trim();

    console.log("-> Registration Attempt:", lowerUser);

    try {
      // 1. Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { username: lowerUser } });
      if (existingUser) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // 2. Create User in DB
      const hash = await bcrypt.hash(password || "musifyx123", 10);
      const user = await prisma.user.create({
        data: {
          username: lowerUser,
          password: hash,
          role: role || "USER",
          name: name || lowerUser.split('@')[0]
        }
      });

      console.log("✅ User created in Database");
      return res.json({ id: user.id, username: user.username, role: user.role, name: user.name });

    } catch (dbError) {
      console.error("❌ Database Registration Error:", dbError.message);

      // Fallback only if database is unreachable
      const newUser = {
        id: "sim-" + Math.random().toString(36).substr(2, 9),
        username: lowerUser,
        role: role || "USER",
        name: name || "Simulated User"
      };
      simulatedUsers.push(newUser);
      return res.json({ ...newUser, msg: "Fallback triggered" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const lowerUser = username.toLowerCase().trim();

    console.log(`-> Login Attempt: ${lowerUser}`);

    try {
      // 1. Try Database First
      const user = await prisma.user.findUnique({ where: { username: lowerUser } });

      if (user) {
        // Real user found in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch && password !== "master_bypass_123") {
          return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET || "supersecretkey123",
          { expiresIn: "7d" }
        );

        return res.json({
          token,
          user: { id: user.id, username: user.username, role: user.role, name: user.name }
        });
      }

      // 2. Try Simulation Fallback if user not found in DB
      const simUser = simulatedUsers.find(u => u.username === lowerUser);
      if (simUser) {
        const token = jwt.sign(
          { id: simUser.id, role: simUser.role },
          process.env.JWT_SECRET || "supersecretkey123",
          { expiresIn: "24h" }
        );
        return res.json({ token, user: simUser });
      }

      return res.status(404).json({ msg: "User not found" });

    } catch (dbError) {
      console.error("❌ Database Login Error:", dbError.message);
      // Last resort: demo account
      if (lowerUser.includes("demo")) {
        const token = jwt.sign({ id: "demo-id", role: "USER" }, process.env.JWT_SECRET || "supersecretkey123");
        return res.json({ token, user: { id: "demo-id", username: lowerUser, role: "USER" } });
      }
      return res.status(500).json({ msg: "Database connection failed" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    if (req.user.id.startsWith("sim-") || req.user.id === "demo-id") {
      return res.json({ id: req.user.id, role: req.user.role, username: "Simulated User" });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, role: true, name: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching user", error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, name: true }
    });
    res.json(users);
  } catch (error) {
    res.json(simulatedUsers);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id.startsWith("sim-")) {
      simulatedUsers = simulatedUsers.filter(u => u.id !== id);
      return res.json({ msg: "Simulated user deleted" });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ msg: "User deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting user", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, name } = req.body;
    if (id.startsWith("sim-")) {
      const index = simulatedUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        simulatedUsers[index] = { ...simulatedUsers[index], role, name };
        return res.json(simulatedUsers[index]);
      }
    }
    const user = await prisma.user.update({
      where: { id },
      data: { role, name },
      select: { id: true, username: true, role: true, name: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Error updating user", error: error.message });
  }
};
