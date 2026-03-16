/**
 * Light Archive MCP Server - Next.js API Route
 *
 * MCP Streamable HTTP transport를 Next.js API Route로 구현합니다.
 * POST: MCP 메시지 처리 (JSON-RPC)
 * GET: SSE 스트림 (알림용)
 * DELETE: 세션 종료
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================

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

function generateArchiveId(): string {
  const timestamp = Date.now().toString();
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${timestamp}-${random}`;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }
  return createClient(url, key);
}

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
  if (archive.tags?.length)
    lines.push(`**태그**: ${archive.tags.map((t) => `\`${t}\``).join(", ")}`);
  if (archive.technologies?.length)
    lines.push(
      `**기술**: ${archive.technologies.map((t) => `\`${t}\``).join(", ")}`
    );
  if (archive.created_at)
    lines.push(
      `**생성일**: ${new Date(archive.created_at).toLocaleDateString("ko-KR")}`
    );
  lines.push("");
  return lines.join("\n");
}

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

// ============================================================================
// CORS 헤더
// ============================================================================

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, mcp-session-id",
  "Access-Control-Expose-Headers": "mcp-session-id",
};

// ============================================================================
// MCP SERVER FACTORY
// ============================================================================

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "Light Archive",
    version: "1.0.0",
  });

  // Tool 1: 목록 조회
  server.tool(
    "list_archives",
    "아카이브 목록을 조회합니다. 카테고리, 상태별 필터링 가능.",
    {
      category: z.enum(CATEGORIES).optional().describe("카테고리 필터"),
      status: z.enum(STATUSES).optional().describe("상태 필터"),
      limit: z.number().min(1).max(100).default(DEFAULT_LIMIT).describe("조회 개수"),
      offset: z.number().min(0).default(0).describe("오프셋"),
    },
    async ({ category, status, limit, offset }) => {
      const supabase = getSupabase();
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
      data.forEach((a: ArchiveItem, i: number) =>
        lines.push(formatArchive(a, i + 1))
      );
      return textResult(lines.join("\n"));
    }
  );

  // Tool 2: 검색
  server.tool(
    "search_archives",
    "제목, 설명, 내용에서 키워드로 아카이브를 검색합니다.",
    {
      query: z.string().min(2).max(200).describe("검색어"),
      category: z.enum(CATEGORIES).optional().describe("카테고리 필터"),
      limit: z.number().min(1).max(100).default(DEFAULT_LIMIT).describe("조회 개수"),
      offset: z.number().min(0).default(0).describe("오프셋"),
    },
    async ({ query: searchQuery, category, limit, offset }) => {
      const supabase = getSupabase();
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

      const lines = [`# 검색 결과: '${searchQuery}'`, "", `총 ${data.length}개`, ""];
      data.forEach((a: ArchiveItem, i: number) =>
        lines.push(formatArchive(a, i + 1))
      );
      return textResult(lines.join("\n"));
    }
  );

  // Tool 3: 상세 조회
  server.tool(
    "get_archive",
    "특정 아카이브의 상세 정보(본문 포함)를 조회합니다.",
    { archive_id: z.string().describe("아카이브 ID") },
    async ({ archive_id }) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("archive_items")
        .select("*")
        .eq("id", archive_id)
        .single();
      if (error) return textResult(`오류: ${error.message}`);
      if (!data) return textResult(`아카이브를 찾을 수 없습니다: ${archive_id}`);

      const archive = data as ArchiveItem;
      const lines = [formatArchive(archive), "---", ""];
      if (archive.content) lines.push(archive.content);
      return textResult(lines.join("\n"));
    }
  );

  // Tool 4: 생성
  server.tool(
    "create_archive",
    "새 아카이브를 생성합니다. content는 HTML 형식으로 작성하세요.",
    {
      title: z.string().min(3).max(200).describe("제목"),
      content: z.string().min(10).describe("본문 (HTML 형식)"),
      category: z.enum(CATEGORIES).describe("카테고리"),
      description: z.string().min(10).max(500).describe("설명"),
      tags: z.array(z.string()).min(1).max(10).describe("태그 배열"),
      technologies: z.array(z.string()).min(1).max(20).describe("기술 스택 배열"),
      sub_category: z.string().max(100).optional().describe("서브 카테고리"),
      author: z.string().max(100).optional().describe("작성자"),
      difficulty: z.string().optional().describe("난이도 (초급/중급/고급)"),
      thumbnail_url: z.string().optional().describe("썸네일 URL"),
    },
    async (params) => {
      const supabase = getSupabase();
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
      if (params.sub_category) archiveData.sub_category = params.sub_category;
      if (params.author) archiveData.author = params.author;
      if (params.difficulty) archiveData.difficulty = params.difficulty;
      if (params.thumbnail_url) archiveData.thumbnail_url = params.thumbnail_url;

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
          `> \`update_archive\`로 상태를 published로 변경할 수 있습니다.`,
        ].join("\n")
      );
    }
  );

  // Tool 5: 수정
  server.tool(
    "update_archive",
    "기존 아카이브를 수정합니다. 변경할 필드만 전달하세요.",
    {
      archive_id: z.string().describe("아카이브 ID"),
      title: z.string().min(3).max(200).optional().describe("제목"),
      content: z.string().min(10).optional().describe("본문 (HTML)"),
      description: z.string().min(10).max(500).optional().describe("설명"),
      category: z.enum(CATEGORIES).optional().describe("카테고리"),
      sub_category: z.string().max(100).optional().describe("서브 카테고리"),
      tags: z.array(z.string()).max(10).optional().describe("태그 배열"),
      technologies: z.array(z.string()).max(20).optional().describe("기술 스택"),
      difficulty: z.string().optional().describe("난이도"),
      status: z.enum(STATUSES).optional().describe("상태 변경"),
    },
    async ({ archive_id, ...fields }) => {
      const supabase = getSupabase();
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) updateData[key] = value;
      }
      if (Object.keys(updateData).length === 1)
        return textResult("변경할 내용이 없습니다.");

      const { error } = await supabase
        .from("archive_items")
        .update(updateData)
        .eq("id", archive_id);
      if (error) return textResult(`수정 실패: ${error.message}`);

      const changedFields = Object.keys(fields).filter(
        (k) => fields[k as keyof typeof fields] !== undefined
      );
      return textResult(
        [`# 아카이브 수정 완료`, "", `**ID**: \`${archive_id}\``, `**변경 필드**: ${changedFields.join(", ")}`].join("\n")
      );
    }
  );

  // Tool 6: 삭제
  server.tool(
    "delete_archive",
    "아카이브를 삭제합니다. 되돌릴 수 없으니 주의하세요.",
    { archive_id: z.string().describe("삭제할 아카이브 ID") },
    async ({ archive_id }) => {
      const supabase = getSupabase();
      const { data: existing } = await supabase
        .from("archive_items")
        .select("id, title")
        .eq("id", archive_id)
        .single();
      if (!existing)
        return textResult(`아카이브를 찾을 수 없습니다: ${archive_id}`);

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

  // Tool 7: 유사 아카이브 추천
  server.tool(
    "find_related",
    "특정 아카이브와 유사한 아카이브를 추천합니다.",
    {
      archive_id: z.string().describe("기준 아카이브 ID"),
      limit: z.number().min(1).max(10).default(4).describe("추천 개수"),
    },
    async ({ archive_id, limit }) => {
      const supabase = getSupabase();
      const { data: baseData, error: baseError } = await supabase
        .from("archive_items")
        .select("*")
        .eq("id", archive_id)
        .single();
      if (baseError || !baseData)
        return textResult(`아카이브를 찾을 수 없습니다: ${archive_id}`);

      const base = baseData as ArchiveItem;
      const { data: allData, error: allError } = await supabase
        .from("archive_items")
        .select("*")
        .eq("status", "published")
        .neq("id", archive_id);
      if (allError || !allData?.length)
        return textResult("유사한 아카이브를 찾을 수 없습니다.");

      const all = allData as ArchiveItem[];
      const baseTags = new Set<string>(base.tags || []);
      const baseTech = new Set<string>(base.technologies || []);

      const scored = all
        .map((a) => {
          let score = 0;
          if (a.category === base.category) score += 30;
          for (const tag of baseTags) if (new Set(a.tags || []).has(tag)) score += 10;
          for (const tech of baseTech) if (new Set(a.technologies || []).has(tech)) score += 5;
          return { archive: a, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (!scored.length)
        return textResult(`'${base.title}'와 유사한 아카이브를 찾을 수 없습니다.`);

      const lines = [`# '${base.title}' 관련 아카이브`, "", `총 ${scored.length}개`, ""];
      scored.forEach((item, i) => {
        lines.push(`## ${i + 1}. ${item.archive.title} (유사도: ${item.score}점)`);
        lines.push(`**ID**: \`${item.archive.id}\``);
        lines.push(`**카테고리**: ${item.archive.category}`);
        if (item.archive.tags?.length)
          lines.push(`**태그**: ${item.archive.tags.map((t) => `\`${t}\``).join(", ")}`);
        lines.push("");
      });
      return textResult(lines.join("\n"));
    }
  );

  // Tool 8: 통계
  server.tool(
    "get_stats",
    "아카이브 전체 통계를 조회합니다.",
    {},
    async () => {
      const supabase = getSupabase();
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
        byStatus[item.status || "unknown"] = (byStatus[item.status || "unknown"] || 0) + 1;
        totalViews += item.view_count || 0;
      }

      return textResult(
        [
          `# Light Archive 통계`,
          "",
          `**전체 아카이브**: ${data.length}개`,
          `**총 조회수**: ${totalViews.toLocaleString()}`,
          "",
          "## 카테고리별",
          ...Object.entries(byCategory).map(([cat, count]) => `- ${cat}: ${count}개`),
          "",
          "## 상태별",
          ...Object.entries(byStatus).map(([s, count]) => `- ${s}: ${count}개`),
        ].join("\n")
      );
    }
  );

  return server;
}

// ============================================================================
// TRANSPORT & SESSION 관리
// ============================================================================

// Vercel Serverless는 stateless이므로 요청마다 새 서버+트랜스포트 생성
async function handleMcpRequest(request: Request): Promise<Response> {
  const server = createMcpServer();

  // Stateless 모드: sessionIdGenerator를 undefined로 설정
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);
  return transport.handleRequest(request);
}

// ============================================================================
// NEXT.JS API ROUTE HANDLERS
// ============================================================================

/** POST: MCP JSON-RPC 메시지 처리 */
export async function POST(request: Request): Promise<Response> {
  try {
    const response = await handleMcpRequest(request);
    // CORS 헤더 추가
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      headers.set(key, value);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32603, message: `Internal error: ${error}` },
        id: null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }
}

/** GET: SSE 스트림 (서버→클라이언트 알림) */
export async function GET(): Promise<Response> {
  // Stateless 모드에서는 SSE 불필요 - 메시지로 안내
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "SSE not supported in stateless mode. Use POST for all requests.",
      },
      id: null,
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    }
  );
}

/** DELETE: 세션 종료 */
export async function DELETE(): Promise<Response> {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

/** OPTIONS: CORS preflight */
export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
