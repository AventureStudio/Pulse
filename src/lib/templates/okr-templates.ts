import type { Template, TemplateSector, TemplateTeamSize } from "@/types";

const techTemplates: Template[] = [
  {
    id: "tech-product-growth",
    name: "Croissance Produit Tech",
    description: "Template pour équipes produit focalisées sur la croissance utilisateur et l'engagement",
    sector: "tech",
    teamSize: ["startup", "small", "medium"],
    type: "predefined",
    objectives: [
      {
        title: "Augmenter l'adoption utilisateur",
        description: "Développer notre base d'utilisateurs actifs et améliorer l'engagement produit",
        level: "company",
        suggestedMetrics: [
          {
            title: "Utilisateurs actifs mensuels",
            metricType: "number",
            startValue: 1000,
            targetValue: 5000,
            unit: "utilisateurs",
          },
          {
            title: "Taux de rétention D7",
            metricType: "percentage",
            startValue: 25,
            targetValue: 40,
            unit: "%",
          },
          {
            title: "Temps d'engagement moyen",
            metricType: "number",
            startValue: 5,
            targetValue: 12,
            unit: "minutes/session",
          }
        ],
        bestPractices: [
          "Définir clairement qui est un 'utilisateur actif'",
          "Segmenter les métriques par cohortes d'acquisition",
          "Suivre les métriques leading et lagging"
        ]
      },
      {
        title: "Améliorer la performance technique",
        description: "Optimiser la vitesse, la fiabilité et la scalabilité de notre plateforme",
        level: "team",
        suggestedMetrics: [
          {
            title: "Temps de chargement moyen",
            metricType: "number",
            startValue: 3.2,
            targetValue: 1.5,
            unit: "secondes",
          },
          {
            title: "Uptime du service",
            metricType: "percentage",
            startValue: 98.5,
            targetValue: 99.9,
            unit: "%",
          }
        ],
        bestPractices: [
          "Mesurer depuis différentes géographies",
          "Inclure les métriques Core Web Vitals",
          "Définir des SLA clairs"
        ]
      }
    ],
    tags: ["croissance", "produit", "performance"],
    createdAt: new Date().toISOString(),
    isPublic: true,
  }
];

const marketingTemplates: Template[] = [
  {
    id: "marketing-acquisition",
    name: "Acquisition Marketing",
    description: "Template pour optimiser l'acquisition client et le funnel de conversion",
    sector: "marketing",
    teamSize: ["small", "medium", "large"],
    type: "predefined",
    objectives: [
      {
        title: "Optimiser l'acquisition client",
        description: "Améliorer la qualité et le volume des leads générés par nos campagnes",
        level: "team",
        suggestedMetrics: [
          {
            title: "Leads qualifiés mensuels",
            metricType: "number",
            startValue: 100,
            targetValue: 300,
            unit: "leads",
          },
          {
            title: "Coût d'acquisition client (CAC)",
            metricType: "currency",
            startValue: 150,
            targetValue: 100,
            unit: "€",
          },
          {
            title: "Taux de conversion lead → client",
            metricType: "percentage",
            startValue: 12,
            targetValue: 20,
            unit: "%",
          }
        ],
        bestPractices: [
          "Définir précisément un lead qualifié (critères BANT)",
          "Tracker les métriques par canal d'acquisition",
          "Calculer le CAC sur une période suffisante"
        ]
      }
    ],
    tags: ["acquisition", "leads", "conversion"],
    createdAt: new Date().toISOString(),
    isPublic: true,
  }
];

const salesTemplates: Template[] = [
  {
    id: "sales-revenue-growth",
    name: "Croissance Revenue",
    description: "Template pour équipes commerciales focalisées sur la croissance du chiffre d'affaires",
    sector: "sales",
    teamSize: ["startup", "small", "medium"],
    type: "predefined",
    objectives: [
      {
        title: "Augmenter le chiffre d'affaires récurrent",
        description: "Développer notre ARR en acquérant de nouveaux clients et en réduisant le churn",
        level: "company",
        suggestedMetrics: [
          {
            title: "ARR (Annual Recurring Revenue)",
            metricType: "currency",
            startValue: 100000,
            targetValue: 250000,
            unit: "€",
          },
          {
            title: "Nombre de nouveaux clients",
            metricType: "number",
            startValue: 8,
            targetValue: 20,
            unit: "clients/mois",
          },
          {
            title: "Taux de churn mensuel",
            metricType: "percentage",
            startValue: 8,
            targetValue: 3,
            unit: "%",
          }
        ],
        bestPractices: [
          "Segmenter l'ARR par taille de client",
          "Distinguer nouveau business vs expansion",
          "Suivre le net revenue retention"
        ]
      }
    ],
    tags: ["revenue", "ARR", "churn"],
    createdAt: new Date().toISOString(),
    isPublic: true,
  }
];

const hrTemplates: Template[] = [
  {
    id: "hr-talent-retention",
    name: "Rétention Talents",
    description: "Template RH pour améliorer l'engagement et la rétention des équipes",
    sector: "hr",
    teamSize: ["medium", "large"],
    type: "predefined",
    objectives: [
      {
        title: "Améliorer l'engagement des employés",
        description: "Créer un environnement de travail plus engageant et satisfaisant",
        level: "company",
        suggestedMetrics: [
          {
            title: "Score d'engagement (eNPS)",
            metricType: "number",
            startValue: 25,
            targetValue: 50,
            unit: "points",
          },
          {
            title: "Taux de turnover annuel",
            metricType: "percentage",
            startValue: 18,
            targetValue: 10,
            unit: "%",
          },
          {
            title: "Temps moyen de remplacement",
            metricType: "number",
            startValue: 90,
            targetValue: 45,
            unit: "jours",
          }
        ],
        bestPractices: [
          "Mesurer l'engagement régulièrement (trimestriel)",
          "Segmenter par département et séniorité",
          "Corréler engagement et performance"
        ]
      }
    ],
    tags: ["engagement", "rétention", "culture"],
    createdAt: new Date().toISOString(),
    isPublic: true,
  }
];

const allTemplates = [
  ...techTemplates,
  ...marketingTemplates, 
  ...salesTemplates,
  ...hrTemplates,
];

export function getOKRTemplates(): Template[] {
  return allTemplates;
}

export function getTemplatesBySector(sector: TemplateSector): Template[] {
  return allTemplates.filter(template => template.sector === sector);
}

export function getTemplatesByTeamSize(teamSize: TemplateTeamSize): Template[] {
  return allTemplates.filter(template => template.teamSize.includes(teamSize));
}

export function searchTemplates(query: string): Template[] {
  const searchLower = query.toLowerCase();
  return allTemplates.filter(template => 
    template.name.toLowerCase().includes(searchLower) ||
    template.description.toLowerCase().includes(searchLower) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchLower))
  );
}