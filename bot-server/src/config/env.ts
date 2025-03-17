import dotenv from "dotenv";

dotenv.config();
export const port = process.env.EXPRESS_PORT;
export const laravelUrl = process.env.LARAVEL_URL;
export const nextJsUrl = process.env.FRONTEND_URL;
export const superAdminToken = process.env.SUPERADMIN_BEARER_TOKEN;