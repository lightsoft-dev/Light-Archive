/**
 * Light Archive MCP Server - Cloudflare Workers
 *
 * Light Archive 아카이브 플랫폼의 원격 MCP 서버입니다.
 * Supabase를 통해 아카이브 CRUD, 검색, 추천 기능을 제공합니다.
 *
 * 배포: Cloudflare Workers (Streamable HTTP transport)
 * 사용: Claude Code/Desktop에서 URL로 연결
 */

import { createMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

interface ArchiveItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  category: string;
  sub_category?: string;
  status?: string;
  tags?: string[];
  technologies?: string[];
  difficulty?: string;
  author?: string;
  thumbnail_url?: string;
  view_count?: number;
  comment_count?: number;
  excerpt?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORIES = ["기술", "프로젝트", "리서치", "뉴스"] as const;
const STATUSES = ["draft", "published", "archived"] as const;
const DEFAULT_LIMIT = 20;

// ============================================================================
// HELPERS
// ============================================================================

/** 아카이브 ID 생성 (Next.js 앱과 동일한 패턴: timestamp-random6) */
function generateArchiveId(): string {
  const timestamp = Date.now().toString();
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${timestamp}-${random}`;
}

/** Supabase 클라이언트 생성 */
function getSupabase(env: Env): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase 환경변수가 설정되지 않았습니다. SUPABASE_URL, SUPABASE_ANON_KEY를 확인하세요."
    );
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

/** 아카이브를 마크다운 형식으로 포맷 */
function formatArchive(archive: ArchiveItem, index?: number): string {
  const prefix = index !== undefined ? `## ${index}. ` : "# ";
  const lines: string[] = [`${prefix}${archive.title}`];

  lines.push(`**ID**: \`${archive.id}\``);
  lines.push(`**카테고리**: ${archive.category}`);

  if (archive.sub_category) lines.push(`**분야**: ${archive.sub_category}`);
  if (archive.status) lines.push(`**상태**: ${archive.status}`);
  if (archive.description) lines.push(`**설명**: ${archive.description}`);
  if (archive.difficulty) lines.push(`**난이도**: ${archive.difficulty}`);
  if (archive.author) lines.push(`**작성자**: ${archive.author}`);
  if (archive.view_count !== undefined)
    lines.push(`**조회수**: ${archive.view_count}`);

  if (archive.tags?.length) {
    lines.push(`**태그**: ${archive.tags.map((t) => `\`${t}\``).join(", ")}`);
  }
  if (archive.technologies?.length) {
    lines.push(
      `**기술**: ${archive.technologies.map((t) => `\`${t}\``).join(", ")}`
    );
  }

  if (archive.created_at) {
    lines.push(
      `**생성일**: ${new Date(archive.created_at).toLocaleDateString("ko-KR")}`
    );
  }

  lines.push("");
  return lines.join("\n");
}

/** 텍스트 응답 생성 헬퍼 */
function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

// ============================================================================
// MCP SERVER FACTORY
// ============================================================================

function createServer(env: Env): McpServer {
  const server = new McpServer({
    name: "Light Archive",
    version: "1.0.0",
  });

  // ------------------------------------------------------------------
  // Tool 1: 아카이브 목록 조회
  // ------------------------------------------------------------------
  server.tool(
    "list_archives",
    "아카이브 목록을 조회합니다. 카테고리, 상태별 필터링 가능.",
    {
      category: z
        .enum(CATEGORIES)
        .optional()
        .describe("카테고리 필터 (기술/프로젝트/리서치/뉴스)"),
      status: z
        .enum(STATUSES)
        .optional()
        .describe("상태 필터 (draft/published/archived)"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .default(DEFAULT_LIMIT)
        .describe("조회 개수"),
      offset: z.number().min(0).default(0).describe("오프셋"),
    },
    async ({ category, status, limit, offset }) => {
      const supabase = getSupabase(env);
      let query = supabase.from("archive_items").select("*");

      if (category) query = query.eq("category", category);
      if (status) query = query.eq("status", status);

      query = query
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) return textResult(`오류: ${error.message}`);
      if (!data?.length) return textResult("아카이브가 없습니다.");

      const lines = [`# 아카이브 목록`, "", `총 ${data.length}개`, ""];
      data.forEach((a: ArchiveItem, i: number) => {
        lines.push(formatArchive(a, i + 1));
      });

      return textResult(lines.join("\n"));
    }
  );

  // ------------------------------------------------------------------
  // Tool 2: 아카이브 검색
  // ------------------------------------------------------------------
  server.tool(
    "search_archives",
    "제목, 설명, 내용에서 키워드로 아카이브를 검색합니다.",
    {
      query: z.string().min(2).max(200).describe("검색어"),
      category: z.enum(CATEGORIES).optional().describe("카테고리 필터"),
      limit: z
        .number()
        .min(1)
        .max(100)
        .default(DEFAULT_LIMIT)
        .describe("조회 개수"),
      offset: z.number().min(0).default(0).describe("오프셋"),
    },
    async ({ query: searchQuery, category, limit, offset }) => {
      const supabase = getSupabase(env);
      const searchTerm = `%${searchQuery}%`;

      let dbQuery = supabase
        .from("archive_items")
        .select("*")
        .eq("status", "published")
        .or(
          `title.ilike.${searchTerm},description.ilike.${searchTerm},content.ilike.${searchTerm}`
        );

      if (category) dbQuery = dbQuery.eq("category", category);

      dbQuery = dbQuery
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

      const { data, error } = await dbQuery;
      if (error) return textResult(`오류: ${error.message}`);
      if (!data?.length)
        return textResult(`검색 결과가 없습니다: '${searchQuery}'`);

      const lines = [
        `# 검색 결과: '${searchQuery}'`,
        "",
        `총 ${data.length}개`,
        "",
      ];
      data.forEach((a: ArchiveItem, i: number) => {
        lines.push(formatArchive(a, i + 1));
      });

      return textResult(lines.join("\n"));
    }
  );

  // ------------------------------------------------------------------
  // Tool 3: 아카이브 상세 조회
  // ------------------------------------------------------------------
  server.tool(
    "get_archive",
    "특정 아카이브의 상세 정보(본문 포함)를 조회합니다.",
    {
      archive_id: z.string().describe("아카이브 ID"),
    },
    async ({ archive_id }) => {
      const supabase = getSupabase(env);
      const { data, error } = await supabase
        .from("archive_items")
        .select("*")
        .eq("id", archive_id)
        .single();

      if (error) return textResult(`오류: ${error.message}`);
      if (!data)
        return textResult(`아카이브를 찾을 수 없습니다: ${archive_id}`);

      const archive = data as ArchiveItem;
      const lines = [formatArchive(archive), "---", ""];

      if (archive.content) {
        lines.push(archive.content);
      }

      return textResult(lines.join("\n"));
    }
  );

  // ------------------------------------------------------------------
  // Tool 4: 아카이브 생성
  // ------------------------------------------------------------------
  server.tool(
    "create_archive",
    "새 아카이브를 생성합니다. content는 반드시 HTML 형식으로 작성하세요 (<h2>, <p>, <ul> 등).",
    {
      title: z.string().min(3).max(200).describe("제목"),
      content: z
        .string()
        .min(10)
        .describe("본문 (HTML 형식: <h2>, <p>, <ul> 등)"),
      category: z.enum(CATEGORIES).describe("카테고리"),
      description: z
        .string()
        .min(10)
        .max(500)
        .describe("설명 (4-5줄 요약)"),
      tags: z.array(z.string()).min(1).max(10).describe("태그 배열"),
      technologies: z
        .array(z.string())
        .min(1)
        .max(20)
        .describe("기술 스택 배열"),
      sub_category: z.string().max(100).optional().describe("서브 카테고리"),
      author: z.string().max(100).optional().describe("작성자"),
      difficulty: z.string().optional().describe("난이도 (초급/중급/고급)"),
      thumbnail_url: z.string().optional().describe("썸네일 URL"),
    },
    async (params) => {
      const supabase = getSupabase(env);
      const now = new Date().toISOString();
      const archiveId = generateArchiveId();

      const archiveData: Record<string, unknown> = {
        id: archiveId,
        title: params.title,
        content: params.content,
        category: params.category,
        description: params.description,
        tags: params.tags,
        technologies: params.technologies,
        status: "draft",
        view_count: 0,
        comment_count: 0,
        created_at: now,
        updated_at: now,
        published_at: now,
      };

      if (params.sub_category)
        archiveData.sub_category = params.sub_category;
      if (params.author) archiveData.author = params.author;
      if (params.difficulty) archiveData.difficulty = params.difficulty;
      if (params.thumbnail_url)
        archiveData.thumbnail_url = params.thumbnail_url;

      const { error } = await supabase
        .from("archive_items")
        .insert(archiveData)
        .select()
        .single();

      if (error) return textResult(`생성 실패: ${error.message}`);

      return textResult(
        [
          `# 아카이브 생성 완료`,
          "",
          `**ID**: \`${archiveId}\``,
          `**제목**: ${params.title}`,
          `**카테고리**: ${params.category}`,
          `**상태**: draft`,
          `**태그**: ${params.tags.join(", ")}`,
          `**기술**: ${params.technologies.join(", ")}`,
          "",
          `> draft 상태로 생성되었습니다. \`update_archive\`로 상태를 published로 변경할 수 있습니다.`,
        ].join("\n")
      );
    }
  );

  // ------------------------------------------------------------------
  // Tool 5: 아카이브 수정
  // ------------------------------------------------------------------
  server.tool(
    "update_archive",
    "기존 아카이브를 수정합니다. 변경할 필드만 전달하세요.",
    {
      archive_id: z.string().describe("아카이브 ID"),
      title: z.string().min(3).max(200).optional().describe("제목"),
      content: z.string().min(10).optional().describe("본문 (HTML)"),
      description: z
        .string()
        .min(10)
        .max(500)
        .optional()
        .describe("설명"),
      category: z.enum(CATEGORIES).optional().describe("카테고리"),
      sub_category: z
        .string()
        .max(100)
        .optional()
        .describe("서브 카테고리"),
      tags: z.array(z.string()).max(10).optional().describe("태그 배열"),
      technologies: z
        .array(z.string())
        .max(20)
        .optional()
        .describe("기술 스택"),
      difficulty: z.string().optional().describe("난이도"),
      status: z.enum(STATUSES).optional().describe("상태 변경"),
    },
    async ({ archive_id, ...fields }) => {
      const supabase = getSupabase(env);

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          updateData[key] = value;
        }
      }

      if (Object.keys(updateData).length === 1) {
        return textResult("변경할 내용이 없습니다.");
      }

      const { error } = await supabase
        .from("archive_items")
        .update(updateData)
        .eq("id", archive_id);

      if (error) return textResult(`수정 실패: ${error.message}`);

      const changedFields = Object.keys(fields).filter(
        (k) => fields[k as keyof typeof fields] !== undefined
      );

      return textResult(
        [
          `# 아카이브 수정 완료`,
          "",
          `**ID**: \`${archive_id}\``,
          `**변경 필드**: ${changedFields.join(", ")}`,
        ].join("\n")
      );
    }
  );

  // ------------------------------------------------------------------
  // Tool 6: 아카이브 삭제
  // ------------------------------------------------------------------
  server.tool(
    "delete_archive",
    "아카이브를 삭제합니다. 되돌릴 수 없으니 주의하세요.",
    {
      archive_id: z.string().describe("삭제할 아카이브 ID"),
    },
    async ({ archive_id }) => {
      const supabase = getSupabase(env);

      const { data: existing } = await supabase
        .from("archive_items")
        .select("id, title")
        .eq("id", archive_id)
        .single();

      if (!existing) {
        return textResult(`아카이브를 찾을 수 없습니다: ${archive_id}`);
      }

      const { error } = await supabase
        .from("archive_items")
        .delete()
        .eq("id", archive_id);

      if (error) return textResult(`삭제 실패: ${error.message}`);

      return textResult(
        `# 아카이브 삭제 완료\n\n**ID**: \`${archive_id}\`\n**제목**: ${existing.title}`
      );
    }
  );

  // ------------------------------------------------------------------
  // Tool 7: 유사 아카이브 추천
  // ------------------------------------------------------------------
  server.tool(
    "find_related",
    "특정 아카이브와 유사한 아카이브를 태그/기술/카테고리 기반으로 추천합니다.",
    {
      archive_id: z.string().describe("기준 아카이브 ID"),
      limit: z.number().min(1).max(10).default(4).describe("추천 개수"),
    },
    async ({ archive_id, limit }) => {
      const supabase = getSupabase(env);

      const { data: baseData, error: baseError } = await supabase
        .from("archive_items")
        .select("*")
        .eq("id", archive_id)
        .single();

      if (baseError || !baseData) {
        return textResult(`아카이브를 찾을 수 없습니다: ${archive_id}`);
      }

      const base = baseData as ArchiveItem;

      const { data: allData, error: allError } = await supabase
        .from("archive_items")
        .select("*")
        .eq("status", "published")
        .neq("id", archive_id);

      if (allError || !allData?.length) {
        return textResult("유사한 아카이브를 찾을 수 없습니다.");
      }

      const all = allData as ArchiveItem[];
      const baseTags = new Set<string>(base.tags || []);
      const baseTech = new Set<string>(base.technologies || []);

      const scored = all
        .map((a) => {
          let score = 0;
          if (a.category === base.category) score += 30;

          const aTags = new Set(a.tags || []);
          for (const tag of baseTags) {
            if (aTags.has(tag)) score += 10;
          }

          const aTech = new Set(a.technologies || []);
          for (const tech of baseTech) {
            if (aTech.has(tech)) score += 5;
          }

          return { archive: a, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (!scored.length) {
        return textResult(
          `'${base.title}'와 유사한 아카이브를 찾을 수 없습니다.`
        );
      }

      const lines = [
        `# '${base.title}' 관련 아카이브`,
        "",
        `총 ${scored.length}개`,
        "",
      ];

      scored.forEach((item, i) => {
        lines.push(
          `## ${i + 1}. ${item.archive.title} (유사도: ${item.score}점)`
        );
        lines.push(`**ID**: \`${item.archive.id}\``);
        lines.push(`**카테고리**: ${item.archive.category}`);
        if (item.archive.tags?.length) {
          lines.push(
            `**태그**: ${item.archive.tags.map((t) => `\`${t}\``).join(", ")}`
          );
        }
        lines.push("");
      });

      return textResult(lines.join("\n"));
    }
  );

  // ------------------------------------------------------------------
  // Tool 8: 통계 조회
  // ------------------------------------------------------------------
  server.tool(
    "get_stats",
    "아카이브 전체 통계를 조회합니다 (카테고리별 개수, 상태별 개수 등).",
    {},
    async () => {
      const supabase = getSupabase(env);

      const { data, error } = await supabase
        .from("archive_items")
        .select("category, status, view_count");

      if (error) return textResult(`오류: ${error.message}`);
      if (!data?.length) return textResult("아카이브가 없습니다.");

      const byCategory: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      let totalViews = 0;

      for (const item of data) {
        byCategory[item.category] = (byCategory[item.category] || 0) + 1;
        byStatus[item.status || "unknown"] =
          (byStatus[item.status || "unknown"] || 0) + 1;
        totalViews += item.view_count || 0;
      }

      const lines = [
        `# Light Archive 통계`,
        "",
        `**전체 아카이브**: ${data.length}개`,
        `**총 조회수**: ${totalViews.toLocaleString()}`,
        "",
        "## 카테고리별",
        ...Object.entries(byCategory).map(
          ([cat, count]) => `- ${cat}: ${count}개`
        ),
        "",
        "## 상태별",
        ...Object.entries(byStatus).map(
          ([status, count]) => `- ${status}: ${count}개`
        ),
      ];

      return textResult(lines.join("\n"));
    }
  );

  return server;
}

// ============================================================================
// WORKER ENTRY POINT
// ============================================================================

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // 루트 경로: 안내 페이지
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          name: "Light Archive MCP Server",
          version: "1.0.0",
          description:
            "AI 기반 기술/프로젝트 아카이브 플랫폼의 MCP 서버입니다.",
          mcp_endpoint: `${url.origin}/mcp`,
          tools: [
            "list_archives",
            "search_archives",
            "get_archive",
            "create_archive",
            "update_archive",
            "delete_archive",
            "find_related",
            "get_stats",
          ],
          usage: {
            claude_code: `claude mcp add --transport http light-archive ${url.origin}/mcp`,
          },
        }),
        {
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    // MCP 엔드포인트: createMcpHandler가 처리
    const server = createServer(env);
    return createMcpHandler(server, {
      route: "/mcp",
      corsOptions: {
        origin: "*",
        methods: "GET, POST, DELETE, OPTIONS",
        headers: "Content-Type, mcp-session-id",
      },
    })(request, env, ctx);
  },
};
