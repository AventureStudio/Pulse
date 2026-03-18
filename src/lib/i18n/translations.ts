export type Locale = "fr" | "en";

export const translations = {
  // ── Common ──
  "common.loading": { fr: "Chargement...", en: "Loading..." },
  "common.redirecting": { fr: "Redirection...", en: "Redirecting..." },
  "common.save": { fr: "Enregistrer", en: "Save" },
  "common.cancel": { fr: "Annuler", en: "Cancel" },
  "common.create": { fr: "Créer", en: "Create" },
  "common.edit": { fr: "Modifier", en: "Edit" },
  "common.delete": { fr: "Supprimer", en: "Delete" },
  "common.close": { fr: "Fermer", en: "Close" },
  "common.back": { fr: "Retour", en: "Back" },
  "common.filter": { fr: "Filtrer", en: "Filter" },
  "common.search": { fr: "Rechercher...", en: "Search..." },
  "common.all": { fr: "Tous", en: "All" },
  "common.yes": { fr: "Oui", en: "Yes" },
  "common.no": { fr: "Non", en: "No" },
  "common.active": { fr: "Active", en: "Active" },
  "common.inactive": { fr: "Inactive", en: "Inactive" },

  // ── Auth ──
  "auth.welcome": { fr: "Bienvenue sur Pulse", en: "Welcome to Pulse" },
  "auth.magicLinkPrompt": { fr: "Entrez votre email pour recevoir un lien de connexion", en: "Enter your email to receive a login link" },
  "auth.emailLabel": { fr: "Email professionnel", en: "Work email" },
  "auth.emailPlaceholder": { fr: "vous@entreprise.com", en: "you@company.com" },
  "auth.sendLink": { fr: "Recevoir le lien", en: "Send link" },
  "auth.sending": { fr: "Envoi en cours...", en: "Sending..." },
  "auth.noPasswordRequired": { fr: "Pas de mot de passe requis. Un nouveau compte sera créé automatiquement si nécessaire.", en: "No password required. A new account will be created automatically if needed." },
  "auth.checkEmail": { fr: "Vérifiez votre email", en: "Check your email" },
  "auth.linkSentTo": { fr: "Un lien de connexion a été envoyé à", en: "A login link has been sent to" },
  "auth.linkExpiry": { fr: "Cliquez sur le lien dans l'email pour vous connecter. Le lien expire dans 1 heure.", en: "Click the link in the email to log in. The link expires in 1 hour." },
  "auth.useAnotherEmail": { fr: "Utiliser un autre email", en: "Use another email" },
  "auth.signOut": { fr: "Se déconnecter", en: "Sign out" },

  // ── Nav ──
  "nav.dashboard": { fr: "Dashboard", en: "Dashboard" },
  "nav.objectives": { fr: "Objectifs", en: "Objectives" },
  "nav.alignment": { fr: "Alignement", en: "Alignment" },
  "nav.teams": { fr: "Équipes", en: "Teams" },
  "nav.periods": { fr: "Périodes", en: "Periods" },
  "nav.settings": { fr: "Paramètres", en: "Settings" },

  // ── Dashboard ──
  "dashboard.title": { fr: "Dashboard", en: "Dashboard" },
  "dashboard.subtitle": { fr: "Vue d'ensemble de vos OKRs", en: "Overview of your OKRs" },
  "dashboard.totalObjectives": { fr: "Objectifs", en: "Objectives" },
  "dashboard.onTrack": { fr: "En bonne voie", en: "On track" },
  "dashboard.atRisk": { fr: "À risque", en: "At risk" },
  "dashboard.offTrack": { fr: "En retard", en: "Off track" },
  "dashboard.avgProgress": { fr: "Progression moyenne", en: "Average progress" },
  "dashboard.recentObjectives": { fr: "Objectifs récents", en: "Recent objectives" },
  "dashboard.byLevel": { fr: "Par niveau", en: "By level" },
  "dashboard.emptyTitle": { fr: "Commencez par créer vos OKRs", en: "Start by creating your OKRs" },
  "dashboard.emptyDesc": { fr: "Définissez vos objectifs et résultats clés pour suivre la progression de votre équipe.", en: "Define your objectives and key results to track your team's progress." },
  "dashboard.createObjective": { fr: "Créer un objectif", en: "Create an objective" },

  // ── Objectives ──
  "objectives.title": { fr: "Objectifs", en: "Objectives" },
  "objectives.subtitle": { fr: "Gérez vos objectifs et résultats clés", en: "Manage your objectives and key results" },
  "objectives.new": { fr: "Nouvel objectif", en: "New objective" },
  "objectives.emptyTitle": { fr: "Aucun objectif pour le moment", en: "No objectives yet" },
  "objectives.emptyDesc": { fr: "Créez votre premier objectif pour commencer à suivre vos OKRs.", en: "Create your first objective to start tracking your OKRs." },
  "objectives.detail.keyResults": { fr: "Résultats clés", en: "Key results" },
  "objectives.detail.addKR": { fr: "Ajouter un résultat clé", en: "Add a key result" },
  "objectives.detail.noKR": { fr: "Aucun résultat clé pour cet objectif.", en: "No key results for this objective." },
  "objectives.detail.addKRPrompt": { fr: "Ajoutez des résultats clés mesurables pour suivre l'avancement.", en: "Add measurable key results to track progress." },
  "objectives.detail.alignment": { fr: "Alignement", en: "Alignment" },
  "objectives.detail.parentObjective": { fr: "Objectif parent", en: "Parent objective" },
  "objectives.detail.childObjectives": { fr: "Objectifs enfants", en: "Child objectives" },
  "objectives.detail.noAlignment": { fr: "Aucun lien d'alignement pour cet objectif.", en: "No alignment links for this objective." },
  "objectives.detail.confirmDelete": { fr: "Supprimer ce résultat clé ?", en: "Delete this key result?" },
  "objectives.detail.facilitatorGuide": { fr: "Consignes facilitateur", en: "Facilitator guide" },
  "objectives.edit.title": { fr: "Modifier l'objectif", en: "Edit objective" },
  "objectives.edit.subtitle": { fr: "Mettez à jour les informations de cet objectif", en: "Update this objective's information" },
  "objectives.edit.backToObjective": { fr: "Retour à l'objectif", en: "Back to objective" },
  "objectives.new.title": { fr: "Nouvel objectif", en: "New objective" },
  "objectives.new.subtitle": { fr: "Définissez un nouvel objectif pour votre organisation", en: "Define a new objective for your organization" },

  // ── Objectives Filters ──
  "objectives.allLevels": { fr: "Tous les niveaux", en: "All levels" },
  "objectives.allStatuses": { fr: "Tous les statuts", en: "All statuses" },
  "objectives.searchPlaceholder": { fr: "Rechercher un objectif...", en: "Search an objective..." },

  // ── Levels ──
  "level.company": { fr: "Entreprise", en: "Company" },
  "level.team": { fr: "Équipe", en: "Team" },
  "level.individual": { fr: "Individuel", en: "Individual" },

  // ── Status ──
  "status.draft": { fr: "Brouillon", en: "Draft" },
  "status.active": { fr: "Actif", en: "Active" },
  "status.completed": { fr: "Terminé", en: "Completed" },
  "status.cancelled": { fr: "Annulé", en: "Cancelled" },
  "status.markActive": { fr: "Activer", en: "Activate" },
  "status.markCompleted": { fr: "Marquer comme terminé", en: "Mark as completed" },

  // ── Confidence ──
  "confidence.on_track": { fr: "En bonne voie", en: "On track" },
  "confidence.at_risk": { fr: "À risque", en: "At risk" },
  "confidence.off_track": { fr: "En retard", en: "Off track" },

  // ── Key Results ──
  "kr.title": { fr: "Résultat clé", en: "Key result" },
  "kr.notFound": { fr: "Résultat clé introuvable.", en: "Key result not found." },
  "kr.backToObjective": { fr: "Retour à l'objectif", en: "Back to objective" },
  "kr.update": { fr: "Mettre à jour", en: "Update" },
  "kr.editKR": { fr: "Modifier le résultat clé", en: "Edit key result" },
  "kr.deleteKR": { fr: "Supprimer le résultat clé", en: "Delete key result" },
  "kr.confirmDelete": { fr: "Supprimer ce résultat clé ?", en: "Delete this key result?" },
  "kr.start": { fr: "Départ", en: "Start" },
  "kr.target": { fr: "Cible", en: "Target" },
  "kr.current": { fr: "Actuel", en: "Current" },
  "kr.history": { fr: "Historique des mises à jour", en: "Update history" },
  "kr.noHistory": { fr: "Aucune mise à jour pour le moment.", en: "No updates yet." },

  // ── Key Result Card ──
  "kr.updateAction": { fr: "Mettre à jour", en: "Update" },

  // ── Teams ──
  "teams.title": { fr: "Équipes", en: "Teams" },
  "teams.subtitle": { fr: "Gérez vos équipes et leurs OKRs", en: "Manage your teams and their OKRs" },
  "teams.new": { fr: "Nouvelle équipe", en: "New team" },
  "teams.emptyTitle": { fr: "Aucune équipe créée", en: "No teams created" },
  "teams.emptyDesc": { fr: "Créez des équipes pour organiser vos objectifs par département.", en: "Create teams to organize your objectives by department." },
  "teams.nameLabel": { fr: "Nom de l'équipe", en: "Team name" },
  "teams.namePlaceholder": { fr: "Ex: Marketing, Ventes, Tech...", en: "E.g.: Marketing, Sales, Tech..." },
  "teams.descLabel": { fr: "Description", en: "Description" },
  "teams.descPlaceholder": { fr: "Décrivez le rôle de cette équipe...", en: "Describe this team's role..." },
  "teams.members": { fr: "membres", en: "members" },

  // ── Periods ──
  "periods.title": { fr: "Périodes", en: "Periods" },
  "periods.subtitle": { fr: "Gérez les cycles OKR (trimestres, semestres...)", en: "Manage OKR cycles (quarters, semesters...)" },
  "periods.new": { fr: "Nouvelle période", en: "New period" },
  "periods.emptyTitle": { fr: "Définissez vos périodes OKR", en: "Define your OKR periods" },
  "periods.emptyDesc": { fr: "Créez des trimestres ou semestres pour organiser vos objectifs dans le temps.", en: "Create quarters or semesters to organize your objectives over time." },
  "periods.labelField": { fr: "Libellé", en: "Label" },
  "periods.labelPlaceholder": { fr: "Ex: Q1 2026, S1 2026...", en: "E.g.: Q1 2026, H1 2026..." },
  "periods.startDate": { fr: "Date de début", en: "Start date" },
  "periods.endDate": { fr: "Date de fin", en: "End date" },
  "periods.setActive": { fr: "Définir comme période active", en: "Set as active period" },
  "periods.activate": { fr: "Activer", en: "Activate" },

  // ── Alignment ──
  "alignment.title": { fr: "Alignement", en: "Alignment" },
  "alignment.subtitle": { fr: "Visualisez la hiérarchie de vos OKRs", en: "Visualize your OKR hierarchy" },
  "alignment.emptyTitle": { fr: "Arbre d'alignement", en: "Alignment tree" },
  "alignment.emptyDesc": { fr: "L'arbre d'alignement apparaîtra ici lorsque vous aurez des objectifs avec des liens parent/enfant.", en: "The alignment tree will appear here when you have objectives with parent/child links." },

  // ── Settings ──
  "settings.title": { fr: "Paramètres", en: "Settings" },
  "settings.subtitle": { fr: "Configurez votre profil et l'application", en: "Configure your profile and the application" },
  "settings.comingSoon": { fr: "Les paramètres seront disponibles prochainement.", en: "Settings will be available soon." },

  // ── Objective Detail extras ──
  "objectives.detail.notFound": { fr: "Objectif introuvable.", en: "Objective not found." },
  "objectives.detail.backToObjectives": { fr: "Retour aux objectifs", en: "Back to objectives" },
  "objectives.detail.progression": { fr: "Progression", en: "Progress" },
  "objectives.detail.responsible": { fr: "Responsable", en: "Owner" },
  "objectives.detail.team": { fr: "Équipe", en: "Team" },
  "objectives.detail.period": { fr: "Période", en: "Period" },
  "objectives.detail.cancelObjective": { fr: "Annuler", en: "Cancel" },

  // ── Key Result Detail extras ──
  "kr.responsible": { fr: "Responsable", en: "Owner" },

  // ── Objective Form ──
  "form.objective.titleLabel": { fr: "Titre de l'objectif", en: "Objective title" },
  "form.objective.titlePlaceholder": { fr: "Ex : Augmenter la satisfaction client", en: "E.g.: Increase customer satisfaction" },
  "form.objective.descLabel": { fr: "Description", en: "Description" },
  "form.objective.descPlaceholder": { fr: "Décrivez l'objectif et son contexte...", en: "Describe the objective and its context..." },
  "form.objective.levelLabel": { fr: "Niveau", en: "Level" },
  "form.objective.periodLabel": { fr: "Période", en: "Period" },
  "form.objective.selectPeriod": { fr: "Sélectionner une période", en: "Select a period" },
  "form.objective.teamLabel": { fr: "Équipe", en: "Team" },
  "form.objective.selectTeam": { fr: "Sélectionner une équipe", en: "Select a team" },
  "form.objective.noTeam": { fr: "Aucune équipe", en: "No team" },
  "form.objective.parentLabel": { fr: "Objectif parent (alignement)", en: "Parent objective (alignment)" },
  "form.objective.selectParent": { fr: "Aucun (objectif racine)", en: "None (root objective)" },
  "form.objective.statusLabel": { fr: "Statut", en: "Status" },
  "form.objective.step": { fr: "Étape", en: "Step" },
  "form.objective.of": { fr: "sur", en: "of" },
  "form.objective.step1Title": { fr: "Identité de l'objectif", en: "Objective identity" },
  "form.objective.step1Help": { fr: "Un bon objectif est ambitieux, qualitatif et inspirant.", en: "A good objective is ambitious, qualitative and inspiring." },
  "form.objective.step2Title": { fr: "Contexte et alignement", en: "Context and alignment" },
  "form.objective.step2Help": { fr: "Rattachez l'objectif à une période et une équipe pour assurer l'alignement.", en: "Link the objective to a period and team for alignment." },
  "form.objective.step3Title": { fr: "Récapitulatif", en: "Summary" },
  "form.objective.step3Help": { fr: "Vérifiez les informations avant de créer l'objectif.", en: "Review the information before creating the objective." },
  "form.objective.next": { fr: "Suivant", en: "Next" },
  "form.objective.previous": { fr: "Retour", en: "Back" },
  "form.objective.createObjective": { fr: "Créer l'objectif", en: "Create objective" },
  "form.objective.updateObjective": { fr: "Mettre à jour", en: "Update" },
  "form.objective.notFound": { fr: "Objectif introuvable.", en: "Objective not found." },
  "form.objective.helpLevel": { fr: "Entreprise : objectif stratégique global. Équipe : objectif de groupe. Individuel : contribution personnelle.", en: "Company: global strategic objective. Team: group objective. Individual: personal contribution." },
  "form.objective.helpPeriod": { fr: "Sélectionnez la période (trimestre, semestre...) durant laquelle cet objectif sera poursuivi.", en: "Select the period (quarter, semester...) during which this objective will be pursued." },
  "form.objective.helpTeam": { fr: "L'équipe responsable de cet objectif.", en: "The team responsible for this objective." },
  "form.objective.helpParent": { fr: "Alignez cet objectif sur un objectif de niveau supérieur pour garantir la cohérence stratégique.", en: "Align this objective with a higher-level objective to ensure strategic coherence." },
  "form.objective.titleRequired": { fr: "Le titre est requis.", en: "Title is required." },
  "form.objective.periodRequired": { fr: "La période est requise.", en: "Period is required." },
  "form.objective.alignedOn": { fr: "Aligné sur", en: "Aligned on" },
  "form.objective.currentSuffix": { fr: "(en cours)", en: "(current)" },

  // ── Key Result Form ──
  "form.kr.titleLabel": { fr: "Titre du résultat clé", en: "Key result title" },
  "form.kr.titlePlaceholder": { fr: "Ex : Augmenter le NPS de 30 à 50", en: "E.g.: Increase NPS from 30 to 50" },
  "form.kr.descLabel": { fr: "Description", en: "Description" },
  "form.kr.descPlaceholder": { fr: "Comment ce résultat clé sera-t-il mesuré ?", en: "How will this key result be measured?" },
  "form.kr.metricType": { fr: "Type de métrique", en: "Metric type" },
  "form.kr.metricNumber": { fr: "Nombre", en: "Number" },
  "form.kr.metricPercentage": { fr: "Pourcentage", en: "Percentage" },
  "form.kr.metricCurrency": { fr: "Devise", en: "Currency" },
  "form.kr.metricBoolean": { fr: "Oui / Non", en: "Yes / No" },
  "form.kr.startValue": { fr: "Valeur de départ", en: "Start value" },
  "form.kr.targetValue": { fr: "Valeur cible", en: "Target value" },
  "form.kr.unit": { fr: "Unité", en: "Unit" },
  "form.kr.booleanDesc": { fr: "Ce résultat clé sera marqué comme atteint ou non atteint.", en: "This key result will be marked as achieved or not achieved." },
  "form.kr.createKR": { fr: "Créer le résultat clé", en: "Create key result" },
  "form.kr.updateKR": { fr: "Mettre à jour", en: "Update" },
  "form.kr.titleRequired": { fr: "Le titre est requis.", en: "Title is required." },
  "form.kr.targetRequired": { fr: "La valeur cible est requise.", en: "Target value is required." },

  // ── Check-in Form ──
  "form.checkin.currentValue": { fr: "Actuel", en: "Current" },
  "form.checkin.targetValue": { fr: "Cible", en: "Target" },
  "form.checkin.newValue": { fr: "Nouvelle valeur", en: "New value" },
  "form.checkin.projectedProgress": { fr: "Progression après mise à jour", en: "Projected progress after update" },
  "form.checkin.confidence": { fr: "Confiance", en: "Confidence" },
  "form.checkin.note": { fr: "Note", en: "Note" },
  "form.checkin.notePlaceholder": { fr: "Qu'est-ce qui a changé depuis le dernier check-in ?", en: "What changed since the last check-in?" },
  "form.checkin.submit": { fr: "Enregistrer la mise à jour", en: "Save update" },

  // ── Check-in Timeline ──
  "timeline.justNow": { fr: "À l'instant", en: "Just now" },
  "timeline.minutesAgo": { fr: "Il y a {n} min", en: "{n} min ago" },
  "timeline.hoursAgo": { fr: "Il y a {n}h", en: "{n}h ago" },
  "timeline.yesterday": { fr: "Hier", en: "Yesterday" },
  "timeline.daysAgo": { fr: "Il y a {n} jours", en: "{n} days ago" },
  "timeline.weeksAgo": { fr: "Il y a {n} sem.", en: "{n} weeks ago" },
  "timeline.noCheckins": { fr: "Aucun check-in", en: "No check-ins" },
  "timeline.noCheckinsDesc": { fr: "Les mises à jour apparaîtront ici au fil du temps.", en: "Updates will appear here over time." },

  // ── Language ──
  "lang.toggle": { fr: "EN", en: "FR" },
} as const;

export type TranslationKey = keyof typeof translations;
