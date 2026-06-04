"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoAuth = void 0;
const apiError_1 = require("../infrastructure/apiError");
const users_store_1 = require("../store/users.store");
const usersStore = new users_store_1.UsersStore();
const demoAuth = async (req, res, next) => {
    const headerValue = req.header("X-Demo-UserId");
    const userId = typeof headerValue === "string" ? headerValue.trim() : "";
    if (!userId) {
        throw new apiError_1.ApiError(401, "UNAUTHORIZED", "Unauthorized", "Header X-Demo-UserId is required");
    }
    if (userId.length > 80 || /[\s'";]/.test(userId)) {
        throw new apiError_1.ApiError(401, "UNAUTHORIZED", "Unauthorized", "Header X-Demo-UserId is invalid");
    }
    const user = await usersStore.getById(userId);
    if (!user) {
        throw new apiError_1.ApiError(401, "UNAUTHORIZED", "Unauthorized", "User from X-Demo-UserId does not exist");
    }
    req.currentUserId = user.id;
    next();
};
exports.demoAuth = demoAuth;
