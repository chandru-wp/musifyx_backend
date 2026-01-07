import express from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// In-memory analytics store (in production, use database)
let analyticsData = {
    totalPlays: 124500,
    avgSession: 42,
    storageUsed: 82,
    apiRequests: 1200000,
    userGrowth: [12, 18, 25, 32, 28, 45, 52], // Last 7 days
    deviceDistribution: {
        mobile: 65,
        desktop: 28,
        tablet: 7
    },
    activeUsers: 3,
    serverStatus: "ONLINE"
};

// Get analytics data
router.get("/", protect, adminOnly, (req, res) => {
    res.json({
        success: true,
        data: analyticsData
    });
});

// Track a play (call this when a song is played)
router.post("/track-play", protect, (req, res) => {
    analyticsData.totalPlays += 1;
    analyticsData.apiRequests += 1;
    res.json({ success: true, totalPlays: analyticsData.totalPlays });
});

// Track API request (middleware could call this)
router.post("/track-request", (req, res) => {
    analyticsData.apiRequests += 1;
    res.json({ success: true });
});

// Update active users count
router.post("/active-user", protect, (req, res) => {
    // In a real app, track unique sessions
    res.json({ success: true, activeUsers: analyticsData.activeUsers });
});

// Get server health/status
router.get("/health", (req, res) => {
    res.json({
        status: analyticsData.serverStatus,
        activeUsers: analyticsData.activeUsers,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

export default router;
