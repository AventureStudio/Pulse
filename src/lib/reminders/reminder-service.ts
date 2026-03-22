import { supabaseAdmin } from "@/lib/supabase-server";
import type { Reminder, ReminderSettings, EscalationRule, ObjectiveLevel, UserRole } from "@/types";

/**
 * Service for managing OKR reminders and escalations
 */
export class ReminderService {
  /**
   * Get default reminder frequency based on user role and objective level
   */
  static getDefaultFrequency(userRole: UserRole, objectiveLevel: ObjectiveLevel): string {
    // More frequent reminders for individual contributors and individual objectives
    if (userRole === 'member' || objectiveLevel === 'individual') {
      return 'weekly';
    }
    // Less frequent for managers and company-level objectives
    if (userRole === 'admin' || objectiveLevel === 'company') {
      return 'monthly';
    }
    // Default for team level and managers
    return 'bi-weekly';
  }

  /**
   * Get default escalation rules based on objective level
   */
  static getDefaultEscalationRules(objectiveLevel: ObjectiveLevel): EscalationRule[] {
    const baseRules: EscalationRule[] = [
      {
        level: 'owner',
        delayDays: 0,
        recipientIds: [],
        isActive: true
      },
      {
        level: 'team_lead',
        delayDays: objectiveLevel === 'individual' ? 3 : 7,
        recipientIds: [],
        isActive: true
      }
    ];

    // Add manager escalation for team and company objectives
    if (objectiveLevel !== 'individual') {
      baseRules.push({
        level: 'manager',
        delayDays: objectiveLevel === 'company' ? 14 : 10,
        recipientIds: [],
        isActive: true
      });
    }

    // Admin escalation for company objectives
    if (objectiveLevel === 'company') {
      baseRules.push({
        level: 'admin',
        delayDays: 21,
        recipientIds: [],
        isActive: true
      });
    }

    return baseRules;
  }

  /**
   * Create reminder for an objective
   */
  static async createReminder(
    objectiveId: string,
    settings: ReminderSettings,
    keyResultId?: string
  ): Promise<Reminder | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('reminders')
        .insert({
          objective_id: objectiveId,
          key_result_id: keyResultId || null,
          trigger_type: settings.triggers[0] || 'no_update',
          frequency: settings.frequency,
          next_send_at: this.calculateNextSendDate(settings.frequency),
          escalation_rules: settings.enableEscalation ? this.getDefaultEscalationRules('team') : [],
          custom_message: settings.customMessage
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reminder:', error);
        return null;
      }

      return this.mapReminderFromDB(data);
    } catch (error) {
      console.error('Error in createReminder:', error);
      return null;
    }
  }

  /**
   * Update reminder settings
   */
  static async updateReminder(
    reminderId: string,
    settings: Partial<ReminderSettings>
  ): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (settings.frequency) {
        updateData.frequency = settings.frequency;
        updateData.next_send_at = this.calculateNextSendDate(settings.frequency);
      }
      
      if (settings.customMessage !== undefined) {
        updateData.custom_message = settings.customMessage;
      }
      
      if (settings.enableEscalation !== undefined) {
        updateData.escalation_rules = settings.enableEscalation 
          ? this.getDefaultEscalationRules('team') 
          : [];
      }

      const { error } = await supabaseAdmin
        .from('reminders')
        .update(updateData)
        .eq('id', reminderId);

      if (error) {
        console.error('Error updating reminder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateReminder:', error);
      return false;
    }
  }

  /**
   * Process due reminders - typically called by cron job
   */
  static async processDueReminders(): Promise<{ processed: number; errors: number }> {
    let processed = 0;
    let errors = 0;

    try {
      // Get reminders that are due
      const { data: dueReminders, error } = await supabaseAdmin
        .from('reminders')
        .select('*')
        .eq('is_active', true)
        .lte('next_send_at', new Date().toISOString());

      if (error) {
        console.error('Error fetching due reminders:', error);
        return { processed: 0, errors: 1 };
      }

      // Process each reminder
      for (const reminder of dueReminders || []) {
        try {
          await supabaseAdmin.rpc('process_reminder_escalation', {
            reminder_uuid: reminder.id
          });
          processed++;
        } catch (err) {
          console.error(`Error processing reminder ${reminder.id}:`, err);
          errors++;
        }
      }
    } catch (error) {
      console.error('Error in processDueReminders:', error);
      errors++;
    }

    return { processed, errors };
  }

  /**
   * Get reminders for an objective
   */
  static async getRemindersForObjective(objectiveId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('reminders')
        .select('*')
        .eq('objective_id', objectiveId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reminders:', error);
        return [];
      }

      return (data || []).map(this.mapReminderFromDB);
    } catch (error) {
      console.error('Error in getRemindersForObjective:', error);
      return [];
    }
  }

  /**
   * Calculate next send date based on frequency
   */
  private static calculateNextSendDate(frequency: string): string {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'bi-weekly':
        now.setDate(now.getDate() + 14);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      default:
        now.setDate(now.getDate() + 7);
    }
    
    return now.toISOString();
  }

  /**
   * Map database row to Reminder type
   */
  private static mapReminderFromDB(data: any): Reminder {
    return {
      id: data.id,
      objectiveId: data.objective_id,
      keyResultId: data.key_result_id,
      trigger: data.trigger_type,
      frequency: data.frequency,
      isActive: data.is_active,
      lastSentAt: data.last_sent_at,
      nextSendAt: data.next_send_at,
      escalationRules: data.escalation_rules || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Deactivate reminder
   */
  static async deactivateReminder(reminderId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('reminders')
        .update({ is_active: false })
        .eq('id', reminderId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Mark reminder as read/acted upon
   */
  static async markReminderActioned(logId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('reminder_logs')
        .update({ 
          action_taken: true,
          read_at: new Date().toISOString()
        })
        .eq('id', logId);

      return !error;
    } catch {
      return false;
    }
  }
}