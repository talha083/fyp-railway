"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeRefreshToken = exports.getRefreshToken = exports.storeRefreshToken = exports.verifyEmailToken = exports.signEmailToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
// Prisma client with connection pooling for serverless
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new client_1.PrismaClient({
    log: ['error'],
});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
const hashPassword = async (plain) => {
    return await bcrypt_1.default.hash(plain, 12);
};
exports.hashPassword = hashPassword;
const comparePassword = async (plain, hash) => {
    return await bcrypt_1.default.compare(plain, hash);
};
exports.comparePassword = comparePassword;
const signAccessToken = (payload) => {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    }
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (payload) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => {
    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    }
    return jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
const signEmailToken = (userId) => {
    if (!process.env.JWT_EMAIL_SECRET) {
        throw new Error('JWT_EMAIL_SECRET environment variable is not set');
    }
    return jsonwebtoken_1.default.sign({ sub: userId }, process.env.JWT_EMAIL_SECRET, { expiresIn: "1h" });
};
exports.signEmailToken = signEmailToken;
const verifyEmailToken = (token) => {
    if (!process.env.JWT_EMAIL_SECRET) {
        throw new Error('JWT_EMAIL_SECRET environment variable is not set');
    }
    return jsonwebtoken_1.default.verify(token, process.env.JWT_EMAIL_SECRET);
};
exports.verifyEmailToken = verifyEmailToken;
const storeRefreshToken = (userId, token) => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return prisma.refreshToken.create({
        data: { userId, token, expiresAt }
    });
};
exports.storeRefreshToken = storeRefreshToken;
const getRefreshToken = (userId) => {
    return prisma.refreshToken.findFirst({
        where: { userId, revoked: false },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getRefreshToken = getRefreshToken;
const revokeRefreshToken = (token) => {
    return prisma.refreshToken.update({
        where: { token },
        data: { revoked: true }
    });
};
exports.revokeRefreshToken = revokeRefreshToken;
