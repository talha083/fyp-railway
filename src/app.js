"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
dotenv_1.default.config();
// Add error handling for imports
try {
    console.log("Starting app initialization...");
}
catch (error) {
    console.error("Error during app initialization:", error);
}
// Check for required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'JWT_EMAIL_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    console.error('Please set these environment variables in your Vercel dashboard');
    // In production, we should still allow the app to start but log the issue
    // The individual endpoints will handle missing env vars gracefully
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        // Test database connection
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require("@prisma/client")));
        const prisma = new PrismaClient();
        await prisma.$connect();
        res.status(200).json({
            message: "Server is running",
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            missingEnvVars: missingEnvVars,
            database: "connected"
        });
    }
    catch (error) {
        console.error("Health check error:", error);
        res.status(500).json({
            message: "Server is running but database connection failed",
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            missingEnvVars: missingEnvVars,
            database: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
app.use("/api/auth", authRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ message: "Something went wrong!" });
});
const port = process.env.PORT || 8000;
//Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
exports.default = app;
