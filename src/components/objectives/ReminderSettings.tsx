"use client";

import { useState, useCallback } from "react";
import { Bell, BellOff, Clock, Users, AlertTriangle, Save } from "lucide-react";
import type { ReminderSettings, ReminderFrequency, ReminderTrigger } from "@/types";
import { useI18n } from "@/lib/i18n";

interface ReminderSettingsProps {
  objectiveId: string;
  initialSettings?: ReminderSettings | null;
  onSave: (settings: ReminderSettings) => Promise<void>;
  onCancel: () => void;
}

const frequencyOptions: { value: ReminderFrequency; labelKey: string }[] = [
  { value: "daily", labelKey: "reminders.frequency.daily" },
  { value: "weekly", labelKey: "reminders.frequency.weekly" },
  { value: "bi-weekly", labelKey: "reminders.frequency.biWeekly" },
  { value: "monthly", labelKey: "reminders.frequency.monthly" },
];

const triggerOptions: { value: ReminderTrigger; labelKey: string; description: string }[] = [
  { 
    value: "no_update", 
    labelKey: "reminders.triggers.noUpdate", 
    description: "Pas de mise à jour depuis X jours" 
  },
  { 
    value: "due_date", 
    labelKey: "reminders.triggers.dueDate", 
    description: "Approche de la date limite" 
  },
  { 
    value: "progress_stale", 
    labelKey: "reminders.triggers.progressStale", 
    description: "Aucun progrès depuis X jours" 
  },
];

export default function ReminderSettings({
  objectiveId,
  initialSettings,
  onSave,
  onCancel,
}: ReminderSettingsProps) {
  const { t } = useI18n();
  const [isEnabled, setIsEnabled] = useState(Boolean(initialSettings));
  const [settings, setSettings] = useState<ReminderSettings>(
    initialSettings || {
      frequency: "weekly",
      enableEscalation: true,
      escalationDelay: 7,
      customMessage: null,
      triggers: ["no_update"],
    }
  );
  const [saving, setSaving] = useState(false);

  const updateSetting = useCallback(
    <K extends keyof ReminderSettings>(key: K, value: ReminderSettings[K]) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleTrigger = useCallback((trigger: ReminderTrigger) => {
    setSettings(prev => {
      const currentTriggers = prev.triggers;
      const newTriggers = currentTriggers.includes(trigger)
        ? currentTriggers.filter(t => t !== trigger)
        : [...currentTriggers, trigger];
      
      return { ...prev, triggers: newTriggers };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!isEnabled) {
      // If disabled, we might want to deactivate existing reminders
      onCancel();
      return;
    }

    setSaving(true);
    try {
      await onSave(settings);
    } catch (error) {
      console.error('Failed to save reminder settings:', error);
    } finally {
      setSaving(false);
    }
  }, [isEnabled, settings, onSave, onCancel]);

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Bell className="h-5 w-5 text-primary-600" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              Rappels automatiques
            </h3>
            <p className="text-sm text-gray-500">
              Configurer les notifications de suivi pour cet objectif
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEnabled(!isEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? "bg-primary-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Settings Panel */}
      {isEnabled && (
        <div className="space-y-5 border-t border-gray-100 pt-5">
          {/* Frequency */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Fréquence des rappels
            </label>
            <div className="grid grid-cols-2 gap-2">
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateSetting("frequency", option.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    settings.frequency === option.value
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {option.labelKey}
                </button>
              ))}
            </div>
          </div>

          {/* Triggers */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Déclencheurs
            </label>
            <div className="space-y-2">
              {triggerOptions.map((option) => (
                <label key={option.value} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={settings.triggers.includes(option.value)}
                    onChange={() => toggleTrigger(option.value)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {option.labelKey}
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Escalation */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="h-4 w-4" />
              Escalade hiérarchique
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableEscalation}
                  onChange={(e) => updateSetting("enableEscalation", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-900">
                  Activer l'escalade vers les managers
                </span>
              </label>
              
              {settings.enableEscalation && (
                <div className="ml-7">
                  <label className="block text-xs text-gray-500 mb-1">
                    Délai avant escalade (jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.escalationDelay}
                    onChange={(e) => updateSetting("escalationDelay", parseInt(e.target.value) || 7)}
                    className="input w-20 text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Message personnalisé (optionnel)
            </label>
            <textarea
              value={settings.customMessage || ""}
              onChange={(e) => updateSetting("customMessage", e.target.value || null)}
              placeholder="Ajouter un message personnalisé aux rappels..."
              className="input min-h-[80px] resize-y text-sm"
              rows={3}
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-800">
                  Aperçu du rappel
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  Fréquence: {settings.frequency} • 
                  Escalade: {settings.enableEscalation ? `Oui (${settings.escalationDelay}j)` : "Non"}
                  {settings.customMessage && (
                    <div className="mt-2 italic">"{settings.customMessage}"</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary btn-sm"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary btn-sm"
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}