import { NextRequest, NextResponse } from "next/server";
import { withStaffRole } from "@/middlewares/auth";
import { getConfig, setConfig, CONFIG_KEYS } from "@/lib/system-config";

/**
 * GET /api/config/auto-approve - Get current auto-approve setting
 * Anyone can read this
 */
export async function GET() {
    try {
        const value = await getConfig(CONFIG_KEYS.AUTO_APPROVE_BOT_POSTS);
        return NextResponse.json({
            enabled: value === 'true',
            key: CONFIG_KEYS.AUTO_APPROVE_BOT_POSTS
        });
    } catch (error) {
        console.error("Error getting auto-approve config:", error);
        return NextResponse.json(
            { error: "Failed to get config" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/config/auto-approve - Toggle auto-approve setting
 * Only staff roles can modify this
 */
export const POST = withStaffRole(async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { enabled } = body;

        if (typeof enabled !== 'boolean') {
            return NextResponse.json(
                { error: "enabled must be a boolean" },
                { status: 400 }
            );
        }

        await setConfig(CONFIG_KEYS.AUTO_APPROVE_BOT_POSTS, String(enabled));

        return NextResponse.json({
            success: true,
            enabled,
            message: enabled
                ? "Bot posts will now be auto-approved"
                : "Bot posts will require manual approval"
        });
    } catch (error) {
        console.error("Error setting auto-approve config:", error);
        return NextResponse.json(
            { error: "Failed to update config" },
            { status: 500 }
        );
    }
});
