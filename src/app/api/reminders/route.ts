import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase-api";
import { ReminderService } from "@/lib/reminders/reminder-service";
import type { ReminderSettings } from "@/types";

/**
 * GET /api/reminders?objectiveId=xxx
 * Get reminders for an objective
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const { searchParams } = request.nextUrl;
  const objectiveId = searchParams.get("objectiveId");

  if (!objectiveId) {
    return NextResponse.json(
      { error: "objectiveId is required" },
      { status: 400 }
    );
  }

  try {
    const reminders = await ReminderService.getRemindersForObjective(objectiveId);
    return NextResponse.json(reminders);
  } catch (error) {
    console.error("GET /api/reminders error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reminders
 * Create a new reminder
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  try {
    const body = await request.json();
    const { objectiveId, keyResultId, settings } = body;

    if (!objectiveId || !settings) {
      return NextResponse.json(
        { error: "objectiveId and settings are required" },
        { status: 400 }
      );
    }

    const reminderSettings: ReminderSettings = {
      frequency: settings.frequency || 'weekly',
      enableEscalation: settings.enableEscalation ?? true,
      escalationDelay: settings.escalationDelay || 7,
      customMessage: settings.customMessage || null,
      triggers: settings.triggers || ['no_update']
    };

    const reminder = await ReminderService.createReminder(
      objectiveId,
      reminderSettings,
      keyResultId
    );

    if (!reminder) {
      return NextResponse.json(
        { error: "Failed to create reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("POST /api/reminders error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reminders/:id
 * Update reminder settings
 */
export async function PUT(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  try {
    const body = await request.json();
    const { reminderId, settings } = body;

    if (!reminderId || !settings) {
      return NextResponse.json(
        { error: "reminderId and settings are required" },
        { status: 400 }
      );
    }

    const success = await ReminderService.updateReminder(reminderId, settings);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/reminders error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reminders/:id
 * Deactivate a reminder
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  try {
    const body = await request.json();
    const { reminderId } = body;

    if (!reminderId) {
      return NextResponse.json(
        { error: "reminderId is required" },
        { status: 400 }
      );
    }

    const success = await ReminderService.deactivateReminder(reminderId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to deactivate reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/reminders error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}