import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/supabase-api";
import { getOKRTemplates } from "@/lib/templates/okr-templates";
import type { Template, TemplateSector, TemplateTeamSize } from "@/types";

/* ── GET /api/templates ── */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const params = request.nextUrl.searchParams;
  const sector = params.get("sector") as TemplateSector | null;
  const teamSize = params.get("teamSize") as TemplateTeamSize | null;
  const search = params.get("search");

  try {
    // Get predefined templates
    const predefinedTemplates = getOKRTemplates();
    
    // Get custom templates from database
    let customQuery = supabaseAdmin
      .from("okr_templates")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    const { data: customTemplates, error } = await customQuery;
    
    if (error) {
      console.error("GET /api/templates error:", error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Combine and filter templates
    let allTemplates: Template[] = [
      ...predefinedTemplates,
      ...(customTemplates || []).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        sector: template.sector as TemplateSector,
        teamSize: template.team_size as TemplateTeamSize[],
        type: "custom" as const,
        objectives: template.objectives || [],
        tags: template.tags || [],
        createdAt: template.created_at,
        createdBy: template.created_by,
        isPublic: template.is_public,
      }))
    ];

    // Apply filters
    if (sector && sector !== "all") {
      allTemplates = allTemplates.filter(t => t.sector === sector);
    }

    if (teamSize && teamSize !== "all") {
      allTemplates = allTemplates.filter(t => t.teamSize.includes(teamSize));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      allTemplates = allTemplates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json(allTemplates, {
      headers: {
        "Cache-Control": "private, max-age=300, s-maxage=600",
      },
    });
  } catch (error) {
    console.error("GET /api/templates error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/* ── POST /api/templates ── */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from("okr_templates")
      .insert({
        name: body.name,
        description: body.description,
        sector: body.sector,
        team_size: body.teamSize,
        objectives: body.objectives,
        tags: body.tags || [],
        created_by: user.id,
        is_public: body.isPublic || false,
      })
      .select()
      .single();

    if (error) {
      console.error("POST /api/templates error:", error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    const template: Template = {
      id: data.id,
      name: data.name,
      description: data.description,
      sector: data.sector,
      teamSize: data.team_size,
      type: "custom",
      objectives: data.objectives,
      tags: data.tags,
      createdAt: data.created_at,
      createdBy: data.created_by,
      isPublic: data.is_public,
    };

    return NextResponse.json(template, { status: 201 });
  } catch (res) {
    return res as NextResponse;
  }
}