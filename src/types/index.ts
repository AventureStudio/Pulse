// ── Enums as union types ──
export type ObjectiveLevel = "company" | "team" | "individual";
export type ObjectiveStatus = "draft" | "active" | "completed" | "cancelled";
export type Confidence = "on_track" | "at_risk" | "off_track";
export type MetricType = "number" | "percentage" | "currency" | "boolean";
export type UserRole = "admin" | "manager" | "member";
export type ReminderFrequency = "daily" | "weekly" | "bi-weekly" | "monthly";
export type ReminderTrigger = "due_date" | "no_update" | "progress_stale";
export type ReminderStatus = "pending" | "sent" | "completed" | "cancelled";
export type EscalationLevel = "owner" | "team_lead" | "manager" | "admin";

// ── Core models ──
export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  teamId: string | null;
  activity: string | null;
  roleDescription: string | null;
  onboarded: boolean;
  createdAt: string;
}

// ── Invitation ──
export type InvitationStatus = "pending" | "accepted" | "expired";

export interface Invitation {
  id: string;
  email: string;
  invitedBy: string;
  teamId: string | null;
  role: UserRole;
  status: InvitationStatus;
  createdAt: string;
  acceptedAt: string | null;
}

// ── Reminders System ──
export interface Reminder {
  id: string;
  objectiveId: string;
  keyResultId: string | null;
  trigger: ReminderTrigger;
  frequency: ReminderFrequency;
  isActive: boolean;
  lastSentAt: string | null;
  nextSendAt: string;
  escalationRules: EscalationRule[];
  createdAt: string;
  updatedAt: string;
}

export interface EscalationRule {
  level: EscalationLevel;
  delayDays: number;
  recipientIds: string[];
  isActive: boolean;
}

export interface ReminderSettings {
  frequency: ReminderFrequency;
  enableEscalation: boolean;
  escalationDelay: number;
  customMessage: string | null;
  triggers: ReminderTrigger[];
}

export interface ReminderLog {
  id: string;
  reminderId: string;
  status: ReminderStatus;
  recipientId: string;
  escalationLevel: EscalationLevel;
  sentAt: string;
  readAt: string | null;
  actionTaken: boolean;
  createdAt: string;
}

// ── AI types ──
export type AIAction = "suggest_objective" | "reformulate_objective" | "challenge_objective" | "suggest_key_results";

export interface AIRequest {
  action: AIAction;
  context: AIContext;
}

export interface AIContext {
  activity: string | null;
  roleDescription: string | null;
  currentTitle?: string;
  currentDescription?: string;
  objectiveLevel?: ObjectiveLevel;
  existingObjectives?: { title: string; description: string }[];
  parentObjective?: { title: string; description: string } | null;
}

export interface AISuggestion {
  title: string;
  description?: string;
  reasoning?: string;
}

export interface AIKeyResultSuggestion {
  title: string;
  metricType: MetricType;
  startValue: number;
  targetValue: number;
  unit: string;
  reasoning?: string;
}

export interface AIChallenge {
  point: string;
  suggestion: string;
}

export interface AIResponse {
  action: AIAction;
  suggestions?: AISuggestion[];
  keyResults?: AIKeyResultSuggestion[];
  challenges?: AIChallenge[];
  reformulation?: AISuggestion;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  parentTeamId: string | null;
  createdAt: string;
  members?: User[];
  childTeams?: Team[];
}

export interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  level: ObjectiveLevel;
  ownerId: string;
  teamId: string | null;
  periodId: string;
  parentObjectiveId: string | null;
  status: ObjectiveStatus;
  progress: number;
  confidence: Confidence;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  team?: Team;
  period?: Period;
  keyResults?: KeyResult[];
  parentObjective?: Objective;
  childObjectives?: Objective[];
  reminderSettings?: ReminderSettings;
}

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  description: string;
  metricType: MetricType;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  progress: number;
  confidence: Confidence;
  ownerId: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  objective?: Objective;
  checkIns?: CheckIn[];
}

export interface CheckIn {
  id: string;
  keyResultId: string;
  authorId: string;
  previousValue: number;
  newValue: number;
  confidence: Confidence;
  note: string;
  createdAt: string;
  author?: User;
}

// ── UI types ──
export interface ObjectiveFilters {
  level: ObjectiveLevel | "all";
  status: ObjectiveStatus | "all";
  confidence: Confidence | "all";
  teamId: string | "all";
  periodId: string;
  search: string;
}

export interface AlignmentNode {
  objective: Objective;
  children: AlignmentNode[];
  depth: number;
}

export interface DashboardStats {
  totalObjectives: number;
  totalKeyResults: number;
  avgProgress: number;
  onTrackCount: number;
  atRiskCount: number;
  offTrackCount: number;
  recentCheckIns: CheckIn[];
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}