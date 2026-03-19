import path, { dirname } from "node:path";
import { ipcMain, dialog, shell, app, BrowserWindow } from "electron";
import started from "electron-squirrel-startup";
import { readFileSync, mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { EventEmitter } from "node:events";
import { spawn } from "node:child_process";
import { readFile, readdir, rm, stat, mkdir, cp } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import { createTwoFilesPatch } from "diff";
import chokidar from "chokidar";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
function registerIpc(window, workspaceService, runtimeService, appStateStore) {
  workspaceService.onSnapshot((snapshot) => {
    window.webContents.send("workspace:snapshot", snapshot);
  });
  runtimeService.onRunUpdate((result) => {
    window.webContents.send("runtime:run-update", result);
  });
  ipcMain.handle("workspace:get-snapshot", async () => {
    return workspaceService.getSnapshot() ?? workspaceService.initialize();
  });
  ipcMain.handle("workspace:choose-path", async () => {
    const result = await dialog.showOpenDialog(window, {
      properties: ["openDirectory"],
      title: "Select content workspace"
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return workspaceService.setWorkspacePath(result.filePaths[0]);
  });
  ipcMain.handle("workspace:read-file", async (_event, absolutePath) => {
    return workspaceService.readTextFile(absolutePath);
  });
  ipcMain.handle("workspace:save-file", async (_event, payload) => {
    await workspaceService.saveTextFile(payload);
    return true;
  });
  ipcMain.handle("workspace:update-source-approval", async (_event, payload) => {
    return workspaceService.updateSourceApproval(payload);
  });
  ipcMain.handle("workspace:approve-slide-plan", async (_event, projectId) => {
    return workspaceService.approveSlidePlan(projectId);
  });
  ipcMain.handle("workspace:set-project-stage", async (_event, projectId, stage) => {
    return workspaceService.setProjectStage(projectId, stage);
  });
  ipcMain.handle("workspace:spawn-approved", async (_event, sourceId) => {
    return workspaceService.spawnApproved(sourceId);
  });
  ipcMain.handle("workspace:run-validation", async () => {
    return workspaceService.runValidation();
  });
  ipcMain.handle("runtime:get-status", async () => {
    return runtimeService.getStatus();
  });
  ipcMain.handle("runtime:connect", async () => {
    return runtimeService.connect();
  });
  ipcMain.handle("runtime:run-stage", async (_event, request) => {
    return runtimeService.runStage(request);
  });
  ipcMain.handle("runtime:cancel-run", async (_event, runId) => {
    return runtimeService.cancelRun(runId);
  });
  ipcMain.handle("runtime:apply-diff", async (_event, runId) => {
    return runtimeService.applyDiff(runId);
  });
  ipcMain.handle("runtime:discard-run", async (_event, runId) => {
    return runtimeService.discardRun(runId);
  });
  ipcMain.handle("app:get-state", async () => {
    return appStateStore.getState();
  });
  ipcMain.handle("app:open-path", async (_event, targetPath) => {
    await shell.openPath(targetPath);
    return true;
  });
  ipcMain.handle("app:open-external", async (_event, url) => {
    await shell.openExternal(url);
    return true;
  });
}
const DEFAULT_STATE = {
  recentWorkspacePath: null,
  panelState: {},
  runs: []
};
class AppStateStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.state = this.load();
  }
  state = DEFAULT_STATE;
  getState() {
    return this.state;
  }
  setRecentWorkspacePath(workspacePath) {
    this.state = {
      ...this.state,
      recentWorkspacePath: workspacePath
    };
    this.persist();
  }
  upsertRunSummary(summary) {
    const runs = [...this.state.runs];
    const existingIndex = runs.findIndex((run) => run.runId === summary.runId);
    if (existingIndex >= 0) {
      runs[existingIndex] = summary;
    } else {
      runs.unshift(summary);
    }
    this.state = {
      ...this.state,
      runs: runs.slice(0, 50)
    };
    this.persist();
  }
  load() {
    try {
      const raw = readFileSync(this.filePath, "utf8");
      return {
        ...DEFAULT_STATE,
        ...JSON.parse(raw)
      };
    } catch {
      return DEFAULT_STATE;
    }
  }
  persist() {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, `${JSON.stringify(this.state, null, 2)}
`, "utf8");
  }
}
const REQUIRED_PLANNING_FIELDS = /* @__PURE__ */ new Set([
  "candidateId",
  "workingTitle",
  "packaging",
  "reviewStatus",
  "slideCount",
  "contentAngle",
  "whyItDeservesAPost",
  "recommendedPriority"
]);
function parsePlanningCandidates(markdown) {
  const section = extractLevelSection(markdown, 2, "Candidate Plans");
  if (!section) {
    return [];
  }
  const blocks = [];
  const lines = section.split(/\r?\n/);
  let currentHeading = null;
  let currentLines = [];
  const flush = () => {
    if (!currentHeading) {
      return;
    }
    const body = currentLines.join("\n").trim();
    const sections = parseCandidateSections(body);
    const fields = {};
    const fieldRegex = /^- ([A-Za-z][A-Za-z0-9]*):\s*(.+)$/gm;
    let match = null;
    while ((match = fieldRegex.exec(body)) !== null) {
      const key = match[1];
      if (!REQUIRED_PLANNING_FIELDS.has(key)) {
        continue;
      }
      fields[key] = cleanValue(match[2]);
    }
    blocks.push({
      heading: currentHeading,
      candidateId: fields.candidateId || "",
      workingTitle: fields.workingTitle,
      packaging: fields.packaging,
      reviewStatus: fields.reviewStatus,
      slideCount: fields.slideCount,
      contentAngle: fields.contentAngle,
      whyItDeservesAPost: fields.whyItDeservesAPost,
      recommendedPriority: fields.recommendedPriority,
      sections
    });
  };
  for (const line of lines) {
    if (line.startsWith("### ")) {
      flush();
      currentHeading = line.slice(4).trim();
      currentLines = [];
      continue;
    }
    if (currentHeading) {
      currentLines.push(line);
    }
  }
  flush();
  return blocks.filter((candidate) => candidate.candidateId);
}
function extractLevelSection(markdown, level, heading) {
  const lines = markdown.split(/\r?\n/);
  const target = `${"#".repeat(level)} ${heading}`;
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() === target) {
      start = index + 1;
      break;
    }
  }
  if (start === -1) {
    return "";
  }
  let end = lines.length;
  const boundary = new RegExp(`^#{1,${level}}\\s+`);
  for (let index = start; index < lines.length; index += 1) {
    if (boundary.test(lines[index])) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join("\n").trim();
}
function previewText(text, maxLength = 220) {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) {
    return collapsed;
  }
  return `${collapsed.slice(0, maxLength - 3)}...`;
}
function parseCandidateSections(body) {
  const sections = {};
  const lines = body.split(/\r?\n/);
  let currentHeading = null;
  let currentLines = [];
  const flush = () => {
    if (!currentHeading) {
      return;
    }
    sections[currentHeading] = currentLines.join("\n").trim();
  };
  for (const line of lines) {
    if (line.startsWith("#### ")) {
      flush();
      currentHeading = line.slice(5).trim();
      currentLines = [];
      continue;
    }
    if (currentHeading) {
      currentLines.push(line);
    }
  }
  flush();
  return sections;
}
function cleanValue(value) {
  return value.trim().replace(/^`|`$/g, "").replace(/^"|"$/g, "");
}
class WorkspaceService extends EventEmitter {
  constructor(initialWorkspacePath, appStateStore) {
    super();
    this.appStateStore = appStateStore;
    this.workspacePath = initialWorkspacePath;
  }
  workspacePath;
  snapshot = null;
  watcher = null;
  refreshTimer = null;
  getWorkspacePath() {
    return this.workspacePath;
  }
  async initialize() {
    const snapshot = await this.refresh();
    this.startWatching();
    return snapshot;
  }
  async setWorkspacePath(workspacePath) {
    this.workspacePath = workspacePath;
    this.appStateStore.setRecentWorkspacePath(workspacePath);
    this.stopWatching();
    const snapshot = await this.refresh();
    this.startWatching();
    return snapshot;
  }
  getSnapshot() {
    return this.snapshot;
  }
  async refresh() {
    const snapshot = await scanWorkspace(this.workspacePath);
    this.snapshot = snapshot;
    this.emit("snapshot", snapshot);
    return snapshot;
  }
  async readTextFile(absolutePath) {
    this.assertInsideWorkspace(absolutePath);
    return readFile(absolutePath, "utf8");
  }
  async saveTextFile(payload) {
    this.assertInsideWorkspace(payload.absolutePath);
    mkdirSync(path.dirname(payload.absolutePath), { recursive: true });
    writeFileSync(payload.absolutePath, payload.content, "utf8");
    await this.refresh();
  }
  async updateSourceApproval(payload) {
    const sourcePath = path.join(this.workspacePath, "sources", payload.sourceId, "source.json");
    this.assertInsideWorkspace(sourcePath);
    const source = JSON.parse(readFileSync(sourcePath, "utf8"));
    source.analysis = source.analysis ?? {};
    source.generation = source.generation ?? {};
    source.analysis.mainCandidateId = payload.mainCandidateId;
    source.analysis.standaloneCandidateIds = payload.standaloneCandidateIds;
    source.analysis.approvedCandidateIds = payload.approvedCandidateIds;
    source.generation.spawnMode = payload.spawnMode;
    source.status = payload.status;
    writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}
`, "utf8");
    return this.refresh();
  }
  async approveSlidePlan(projectId) {
    const projectDir = path.join(this.workspacePath, "projects", projectId);
    const projectPath = path.join(projectDir, "project.json");
    const project = JSON.parse(readFileSync(projectPath, "utf8"));
    const approvedAt = (/* @__PURE__ */ new Date()).toISOString();
    project.workflow = project.workflow ?? {};
    project.workflow.stage = "plan_approved";
    project.workflow.approvals = project.workflow.approvals ?? {};
    project.workflow.approvals.slidePlan = {
      status: "approved",
      approvedAt
    };
    const approvalsPath = project.paths?.approvals ? path.join(projectDir, project.paths.approvals) : path.join(projectDir, "approvals.json");
    writeFileSync(projectPath, `${JSON.stringify(project, null, 2)}
`, "utf8");
    writeFileSync(
      approvalsPath,
      `${JSON.stringify(project.workflow.approvals ?? {}, null, 2)}
`,
      "utf8"
    );
    ensureDocument(
      path.join(projectDir, project.paths?.carouselDraft ?? "carousel_draft.md"),
      buildSeedCarouselDraft(project)
    );
    ensureDocument(
      path.join(projectDir, project.paths?.handoffBrief ?? "handoff_brief.md"),
      buildSeedHandoff(project)
    );
    return this.refresh();
  }
  async setProjectStage(projectId, stage) {
    const projectPath = path.join(this.workspacePath, "projects", projectId, "project.json");
    const project = JSON.parse(readFileSync(projectPath, "utf8"));
    project.workflow = project.workflow ?? {};
    project.workflow.stage = stage;
    writeFileSync(projectPath, `${JSON.stringify(project, null, 2)}
`, "utf8");
    return this.refresh();
  }
  async spawnApproved(sourceId) {
    await runNodeScript(this.workspacePath, ["scripts/project-ops.js", "spawn-approved", sourceId]);
    return this.refresh();
  }
  async runValidation() {
    return runValidation(this.workspacePath);
  }
  onSnapshot(listener) {
    this.on("snapshot", listener);
  }
  destroy() {
    this.stopWatching();
  }
  startWatching() {
    this.watcher = chokidar.watch(
      [
        path.join(this.workspacePath, "sources"),
        path.join(this.workspacePath, "projects"),
        path.join(this.workspacePath, "brands"),
        path.join(this.workspacePath, "templates"),
        path.join(this.workspacePath, ".agent", "skills")
      ],
      {
        ignoreInitial: true
      }
    );
    this.watcher.on("all", () => {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }
      this.refreshTimer = setTimeout(() => {
        void this.refresh();
      }, 250);
    });
  }
  stopWatching() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.watcher) {
      void this.watcher.close();
      this.watcher = null;
    }
  }
  assertInsideWorkspace(absolutePath) {
    const relative = path.relative(this.workspacePath, absolutePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`Path is outside workspace: ${absolutePath}`);
    }
  }
}
async function scanWorkspace(workspacePath) {
  const validation = await runValidation(workspacePath);
  const [sources, projects, catalog] = await Promise.all([
    loadSources(workspacePath, validation),
    loadProjects(workspacePath, validation),
    loadCatalog(workspacePath)
  ]);
  return {
    workspacePath,
    sources,
    projects,
    catalog,
    validation,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function runValidation(workspacePath) {
  const output = await runNodeScript(workspacePath, ["scripts/project-ops.js", "validate"], true);
  const lines = `${output.stdout}
${output.stderr}`.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const issues = [];
  for (const line of lines) {
    const match = line.match(/^\[(source|project):([^\]]+)\]\s+(.*)$/);
    if (match) {
      issues.push({
        severity: line.includes("warning") ? "warning" : "error",
        scope: match[1],
        entityId: match[2],
        message: match[3]
      });
      continue;
    }
    if (/warning/i.test(line)) {
      issues.push({
        severity: "warning",
        scope: "global",
        message: line
      });
    }
  }
  return {
    ok: issues.every((issue) => issue.severity !== "error"),
    checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
    errors: issues.filter((issue) => issue.severity === "error"),
    warnings: issues.filter((issue) => issue.severity === "warning")
  };
}
function summarizeValidationState(entity, validation) {
  const issues = [...validation.errors, ...validation.warnings].filter(
    (issue) => issue.entityId === entity.id && issue.scope === entity.type
  );
  if (issues.some((issue) => issue.severity === "error")) {
    return "invalid";
  }
  if (issues.some((issue) => issue.severity === "warning")) {
    return "warning";
  }
  return validation.ok ? "valid" : "unknown";
}
async function loadSources(workspacePath, validation) {
  const sourcesDir = path.join(workspacePath, "sources");
  const directories = await listDirectories(sourcesDir);
  const results = [];
  for (const id of directories) {
    const sourceDir = path.join(sourcesDir, id);
    const sourcePath = path.join(sourceDir, "source.json");
    if (!existsSync(sourcePath)) {
      continue;
    }
    const source = JSON.parse(await readFile(sourcePath, "utf8"));
    const planningPath = path.join(sourceDir, "planning.md");
    const planningText = existsSync(planningPath) ? await readFile(planningPath, "utf8") : "";
    const planningCandidates = planningText ? parsePlanningCandidates(planningText) : [];
    const documents = await buildDocuments(sourceDir, [
      ["source", "소스 정보", "source.json"],
      ["planning", "기획안", "planning.md"]
    ]);
    const entity = {
      type: "source",
      id,
      title: source.title || source.topic || source.url || id,
      brand: source.brand || "unknown",
      statusOrStage: source.status || "unknown",
      sourceType: source.sourceType || "unknown",
      status: source.status || "unknown",
      planningPath: existsSync(planningPath) ? planningPath : void 0,
      candidateIds: toStringArray(source.analysis?.candidateIds),
      approvedCandidateIds: toStringArray(source.analysis?.approvedCandidateIds),
      standaloneCandidateIds: toStringArray(source.analysis?.standaloneCandidateIds),
      mainCandidateId: typeof source.analysis?.mainCandidateId === "string" ? source.analysis.mainCandidateId : null,
      spawnMode: typeof source.generation?.spawnMode === "string" ? source.generation.spawnMode : null,
      candidates: planningCandidates,
      documents,
      paths: {
        source: "source.json",
        planning: "planning.md"
      },
      validationState: "unknown",
      lastModifiedAt: maxDocumentTime(documents)
    };
    entity.validationState = summarizeValidationState(entity, validation);
    results.push(entity);
  }
  return results.sort((left, right) => right.lastModifiedAt.localeCompare(left.lastModifiedAt));
}
async function loadProjects(workspacePath, validation) {
  const projectsDir = path.join(workspacePath, "projects");
  const directories = (await listDirectories(projectsDir)).filter((entry) => entry !== "archive");
  const results = [];
  for (const id of directories) {
    const projectDir = path.join(projectsDir, id);
    const projectPath = path.join(projectDir, "project.json");
    if (!existsSync(projectPath)) {
      continue;
    }
    const project = JSON.parse(await readFile(projectPath, "utf8"));
    const documents = await buildDocuments(projectDir, [
      ["project", "프로젝트 정보", "project.json"],
      ["researchBrief", "리서치 브리프", project.paths?.researchBrief ?? "research_brief.md"],
      ["slidePlan", "슬라이드 플랜", project.paths?.slidePlan ?? "slide_plan.md"],
      ["carouselDraft", "원고 초안", project.paths?.carouselDraft ?? "carousel_draft.md"],
      ["handoffBrief", "디자인 브리프", project.paths?.handoffBrief ?? "handoff_brief.md"],
      ["carouselJson", "캐러셀 JSON", project.paths?.carouselJson ?? "carousel.json"],
      ["qaReport", "QA 리포트", project.paths?.qaReport ?? "qa_report.md"]
    ]);
    const entity = {
      type: "project",
      id,
      title: project.title || id,
      brand: project.brand || "unknown",
      statusOrStage: project.workflow?.stage || "unknown",
      stage: project.workflow?.stage || "unknown",
      requiresResearchBrief: Boolean(project.workflow?.requiresResearchBrief),
      qaStatus: project.workflow?.quality?.qaStatus || "not_started",
      approvalStatus: project.workflow?.approvals?.slidePlan?.status || "pending",
      derivedFrom: project.derivedFrom ?? null,
      documents,
      paths: project.paths ?? {},
      validationState: "unknown",
      lastModifiedAt: maxDocumentTime(documents)
    };
    entity.validationState = summarizeValidationState(entity, validation);
    results.push(entity);
  }
  return results.sort((left, right) => right.lastModifiedAt.localeCompare(left.lastModifiedAt));
}
async function loadCatalog(workspacePath) {
  const [brands, templates, skills] = await Promise.all([
    collectCatalogFiles(path.join(workspacePath, "brands")),
    collectCatalogFiles(path.join(workspacePath, "templates")),
    collectCatalogFiles(path.join(workspacePath, ".agent", "skills"))
  ]);
  return { brands, templates, skills };
}
async function collectCatalogFiles(rootDir) {
  if (!existsSync(rootDir)) {
    return [];
  }
  const files = await walkFiles$1(rootDir);
  return files.filter((absolutePath) => /\.(md|json|txt)$/i.test(absolutePath)).map((absolutePath) => {
    const stats = statSync(absolutePath);
    return {
      id: path.relative(rootDir, absolutePath),
      name: path.basename(absolutePath),
      absolutePath,
      relativePath: path.relative(rootDir, absolutePath),
      size: stats.size,
      lastModifiedAt: stats.mtime.toISOString()
    };
  }).sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}
async function buildDocuments(baseDir, entries) {
  const documents = [];
  for (const [key, label, relativePath] of entries) {
    const absolutePath = path.join(baseDir, relativePath);
    const exists = existsSync(absolutePath);
    const preview = exists ? previewText(await readFile(absolutePath, "utf8")) : "";
    documents.push({
      key,
      label,
      absolutePath,
      relativePath,
      exists,
      preview
    });
  }
  return documents;
}
async function listDirectories(directory) {
  if (!existsSync(directory)) {
    return [];
  }
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}
async function walkFiles$1(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles$1(absolutePath));
      continue;
    }
    files.push(absolutePath);
  }
  return files;
}
function maxDocumentTime(documents) {
  const values = documents.filter((document) => document.exists).map((document) => statSync(document.absolutePath).mtime.toISOString());
  return values.sort().at(-1) ?? (/* @__PURE__ */ new Date(0)).toISOString();
}
function ensureDocument(absolutePath, content) {
  if (existsSync(absolutePath)) {
    return;
  }
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, `${content.trimEnd()}
`, "utf8");
}
function buildSeedCarouselDraft(project) {
  const title = String(project.title ?? "Untitled Project");
  const brand = String(project.brand ?? "unknown");
  return [
    `# Carousel Draft - ${title}`,
    "",
    "## Meta",
    `- brand: ${brand}`,
    `- projectId: ${String(project.id ?? "")}`,
    "",
    "## Status",
    "- seedMode: skeleton-only",
    "- owner: content_editor",
    "- sourceOfTruth: slide_plan.md",
    "",
    "## Copy Worksheet",
    "- Fill this document from the approved slide plan.",
    "",
    "## Editor Checklist",
    "- turn each approved slide into final production copy",
    "- keep slide count and message hierarchy aligned with slide_plan.md",
    "- finalize this file before design begins"
  ].join("\n");
}
function buildSeedHandoff(project) {
  const title = String(project.title ?? "Untitled Project");
  const brand = String(project.brand ?? "unknown");
  return [
    `# Designer Handoff - ${title}`,
    "",
    "## Meta",
    `- brand: ${brand}`,
    `- projectId: ${String(project.id ?? "")}`,
    "",
    "## Status",
    "- seedMode: skeleton-only",
    "- owner: content_editor",
    "",
    "## Required Inputs",
    "- read `slide_plan.md` first",
    "- read finalized `carousel_draft.md` second",
    "",
    "## Designer Notes",
    "- add asset paths, crop notes, and layout risks here during handoff"
  ].join("\n");
}
function toStringArray(value) {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
}
async function runNodeScript(workspacePath, args, allowNonZero = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: workspacePath,
      shell: false,
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode !== 0 && !allowNonZero) {
        reject(new Error(stderr || stdout || `Process exited with code ${exitCode}`));
        return;
      }
      resolve({ stdout, stderr, exitCode });
    });
  });
}
const BINARY_EXTENSIONS = /* @__PURE__ */ new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".pdf"
]);
class RuntimeService extends EventEmitter {
  constructor(userDataPath, appStateStore, workspaceService) {
    super();
    this.userDataPath = userDataPath;
    this.appStateStore = appStateStore;
    this.workspaceService = workspaceService;
  }
  activeRuns = /* @__PURE__ */ new Map();
  resolvedCodexCommand = null;
  async getStatus() {
    try {
      const codex = await this.getCodexCommand();
      const result = await runProcess(
        codex.command,
        [...codex.baseArgs, "login", "status"],
        this.workspaceService.getWorkspacePath(),
        true
      );
      const parsedStatus = parseProviderStatusOutput(result.stdout, result.stderr);
      return {
        provider: "codex-openai",
        connected: parsedStatus.connected,
        accountLabel: parsedStatus.accountLabel,
        canRun: parsedStatus.connected,
        lastCheckedAt: (/* @__PURE__ */ new Date()).toISOString(),
        error: parsedStatus.connected ? void 0 : parsedStatus.message || "Codex login status unavailable"
      };
    } catch (error) {
      return {
        provider: "codex-openai",
        connected: false,
        canRun: false,
        lastCheckedAt: (/* @__PURE__ */ new Date()).toISOString(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  async connect() {
    const codex = await this.getCodexCommand();
    if (process.platform === "win32") {
      spawn(
        "cmd.exe",
        ["/d", "/k", buildWindowsCommandLine(codex, ["login", "--device-auth"])],
        {
          detached: true,
          stdio: "ignore",
          windowsHide: false
        }
      ).unref();
    } else if (process.platform === "darwin") {
      spawn("open", ["-a", "Terminal", "codex", "login", "--device-auth"], {
        detached: true,
        stdio: "ignore"
      }).unref();
    } else {
      spawn("x-terminal-emulator", ["-e", "codex", "login", "--device-auth"], {
        detached: true,
        stdio: "ignore"
      }).unref();
    }
    return {
      provider: "codex-openai",
      connected: false,
      canRun: false,
      lastCheckedAt: (/* @__PURE__ */ new Date()).toISOString(),
      error: "Device login launched in an external terminal. Refresh status after completing sign-in."
    };
  }
  async runStage(request) {
    const runId = randomUUID();
    const workspacePath = this.workspaceService.getWorkspacePath();
    const tempWorkspacePath = path.join(this.userDataPath, "content-os-runs", runId, "workspace");
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const baselineSnapshot = await snapshotAllowedOutputs(workspacePath, request.cwd, request.allowedOutputs);
    await copyWorkspace(workspacePath, tempWorkspacePath);
    const activeRun = {
      workspacePath,
      tempWorkspacePath,
      baselineSnapshot,
      result: {
        runId,
        status: "running",
        request,
        logs: [
          createLog("system", `Prepared temp workspace at ${tempWorkspacePath}`)
        ],
        diff: "",
        touchedFiles: [],
        validation: null,
        artifacts: [],
        createdAt
      }
    };
    this.activeRuns.set(runId, activeRun);
    this.persistSummary(activeRun.result);
    this.emitUpdate(activeRun.result);
    try {
      if (request.stage === "render-preview") {
        await this.executeRenderPreview(activeRun);
      } else {
        await this.executeCodexRun(activeRun);
      }
      const comparison = await compareAllowedOutputs(
        workspacePath,
        tempWorkspacePath,
        request.cwd,
        request.allowedOutputs
      );
      activeRun.result.diff = comparison.diff;
      activeRun.result.touchedFiles = comparison.touchedFiles;
      activeRun.result.artifacts = comparison.artifacts;
      activeRun.result.validation = await runValidation(tempWorkspacePath);
      activeRun.result.status = "completed";
      activeRun.result.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      activeRun.result.logs.push(
        createLog(
          "system",
          `Run finished with ${comparison.touchedFiles.length} changed file(s) and ${comparison.artifacts.length} artifact(s).`
        )
      );
    } catch (error) {
      activeRun.result.status = "failed";
      activeRun.result.error = error instanceof Error ? error.message : String(error);
      activeRun.result.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      activeRun.result.logs.push(createLog("error", activeRun.result.error));
    }
    this.persistSummary(activeRun.result);
    this.emitUpdate(activeRun.result);
    return activeRun.result;
  }
  async cancelRun(runId) {
    const run = this.activeRuns.get(runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }
    run.process?.kill();
    run.result.status = "cancelled";
    run.result.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    run.result.logs.push(createLog("system", "Run cancelled by operator."));
    this.persistSummary(run.result);
    this.emitUpdate(run.result);
    return run.result;
  }
  async applyDiff(runId) {
    const run = this.activeRuns.get(runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }
    if (run.result.status !== "completed") {
      throw new Error("Only completed runs can be applied.");
    }
    const currentSnapshot = await snapshotAllowedOutputs(
      run.workspacePath,
      run.result.request.cwd,
      run.result.request.allowedOutputs
    );
    if (!snapshotEquals(currentSnapshot, run.baselineSnapshot)) {
      throw new Error("Workspace changed since this run started. Reload or rerun before applying.");
    }
    await copyAllowedOutputs(
      run.tempWorkspacePath,
      run.workspacePath,
      run.result.request.cwd,
      run.result.request.allowedOutputs
    );
    await applyStageTransition(run.workspacePath, run.result.request);
    run.result.status = "applied";
    run.result.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    run.result.logs.push(createLog("system", "Approved and applied to the workspace."));
    this.persistSummary(run.result);
    this.emitUpdate(run.result);
    await this.workspaceService.refresh();
    return run.result;
  }
  async discardRun(runId) {
    const run = this.activeRuns.get(runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }
    run.process?.kill();
    await rm(path.join(this.userDataPath, "content-os-runs", runId), {
      recursive: true,
      force: true
    });
    run.result.status = "discarded";
    run.result.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    run.result.logs.push(createLog("system", "Run discarded and temp workspace removed."));
    this.persistSummary(run.result);
    this.emitUpdate(run.result);
    return run.result;
  }
  onRunUpdate(listener) {
    this.on("run-update", listener);
  }
  async executeCodexRun(run) {
    const prompt = buildStagePrompt(run.result.request);
    const codex = await this.getCodexCommand();
    run.result.logs.push(createLog("system", "Launching Codex exec in temp workspace."));
    this.emitUpdate(run.result);
    const child = spawn(
      codex.command,
      [
        ...codex.baseArgs,
        "exec",
        "--json",
        "--ephemeral",
        "--skip-git-repo-check",
        "--color",
        "never",
        "-C",
        run.tempWorkspacePath,
        "-s",
        "workspace-write",
        "-"
      ],
      {
        cwd: run.tempWorkspacePath,
        shell: shouldUseShellForCommand(codex.command),
        windowsHide: true
      }
    );
    run.process = child;
    let stdoutBuffer = "";
    child.stdin.write(prompt);
    child.stdin.end();
    child.stdout.on("data", (chunk) => {
      stdoutBuffer += chunk.toString();
      const parts = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = parts.pop() ?? "";
      for (const line of parts) {
        if (!line.trim()) {
          continue;
        }
        try {
          const event = JSON.parse(line);
          consumeCodexEvent(run.result, event);
        } catch {
          run.result.logs.push(createLog("system", line));
        }
        this.emitUpdate(run.result);
      }
    });
    child.stderr.on("data", (chunk) => {
      run.result.logs.push(createLog("error", chunk.toString().trim()));
      this.emitUpdate(run.result);
    });
    await new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Codex exec exited with code ${code}`));
          return;
        }
        resolve();
      });
    });
  }
  async executeRenderPreview(run) {
    run.result.logs.push(createLog("system", "Rendering preview from carousel.json."));
    this.emitUpdate(run.result);
    const dataPath = path.join(run.result.request.cwd, "carousel.json");
    const outputPath = path.join(run.result.request.cwd, "renders", "current");
    const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
    const result = await runProcess(
      npmCommand,
      ["run", "render:preview", "--", "--data", dataPath, "--output", outputPath],
      run.tempWorkspacePath,
      false
    );
    if (result.stdout.trim()) {
      run.result.logs.push(createLog("command", result.stdout.trim()));
    }
    if (result.stderr.trim()) {
      run.result.logs.push(createLog("error", result.stderr.trim()));
    }
    this.emitUpdate(run.result);
  }
  emitUpdate(result) {
    this.emit("run-update", { ...result, logs: [...result.logs], artifacts: [...result.artifacts] });
  }
  persistSummary(result) {
    const summary = {
      runId: result.runId,
      entityType: result.request.entityType,
      entityId: result.request.entityId,
      stage: result.request.stage,
      status: result.status,
      createdAt: result.createdAt,
      completedAt: result.completedAt
    };
    this.appStateStore.upsertRunSummary(summary);
  }
  async getCodexCommand() {
    if (!this.resolvedCodexCommand) {
      this.resolvedCodexCommand = await resolveCodexCommand();
    }
    return this.resolvedCodexCommand;
  }
}
function snapshotEquals(left, right) {
  if (left.size !== right.size) {
    return false;
  }
  for (const [key, value] of left) {
    if (right.get(key) !== value) {
      return false;
    }
  }
  return true;
}
async function snapshotAllowedOutputs(workspaceRoot, cwdRelative, allowedOutputs) {
  const snapshot = /* @__PURE__ */ new Map();
  const entityRoot = path.join(workspaceRoot, cwdRelative);
  for (const output of allowedOutputs) {
    const absoluteOutput = path.join(entityRoot, output);
    if (!existsSync(absoluteOutput)) {
      continue;
    }
    const stats = await stat(absoluteOutput);
    if (stats.isDirectory()) {
      const files = await walkFiles(absoluteOutput);
      for (const file of files) {
        snapshot.set(
          normalizePath(path.relative(workspaceRoot, file)),
          await hashFile(file)
        );
      }
      continue;
    }
    snapshot.set(
      normalizePath(path.relative(workspaceRoot, absoluteOutput)),
      await hashFile(absoluteOutput)
    );
  }
  return snapshot;
}
async function compareAllowedOutputs(originalRoot, tempRoot, cwdRelative, allowedOutputs) {
  const originalSnapshot = await snapshotAllowedOutputs(originalRoot, cwdRelative, allowedOutputs);
  const tempSnapshot = await snapshotAllowedOutputs(tempRoot, cwdRelative, allowedOutputs);
  const keys = /* @__PURE__ */ new Set([...originalSnapshot.keys(), ...tempSnapshot.keys()]);
  const patches = [];
  const touchedFiles = [];
  const artifacts = [];
  for (const key of keys) {
    if (originalSnapshot.get(key) === tempSnapshot.get(key)) {
      continue;
    }
    touchedFiles.push(key);
    const originalFile = path.join(originalRoot, key);
    const tempFile = path.join(tempRoot, key);
    if (isBinaryFile(key)) {
      artifacts.push({
        relativePath: key,
        absolutePath: tempFile,
        kind: /\.(png|jpg|jpeg|gif|webp)$/i.test(key) ? "image" : "file"
      });
      continue;
    }
    const originalText = existsSync(originalFile) ? await readFile(originalFile, "utf8") : "";
    const tempText = existsSync(tempFile) ? await readFile(tempFile, "utf8") : "";
    patches.push(
      createTwoFilesPatch(
        key,
        key,
        originalText,
        tempText,
        "workspace",
        "candidate"
      )
    );
  }
  return {
    diff: patches.join("\n"),
    touchedFiles,
    artifacts
  };
}
async function copyAllowedOutputs(fromWorkspaceRoot, toWorkspaceRoot, cwdRelative, allowedOutputs) {
  const entityFromRoot = path.join(fromWorkspaceRoot, cwdRelative);
  const entityToRoot = path.join(toWorkspaceRoot, cwdRelative);
  for (const output of allowedOutputs) {
    const fromPath = path.join(entityFromRoot, output);
    const toPath = path.join(entityToRoot, output);
    if (!existsSync(fromPath)) {
      await rm(toPath, { recursive: true, force: true });
      continue;
    }
    await rm(toPath, { recursive: true, force: true });
    await mkdir(path.dirname(toPath), { recursive: true });
    await cp(fromPath, toPath, { recursive: true });
  }
}
async function applyStageTransition(workspaceRoot, request) {
  if (request.entityType === "source" && request.stage === "source-planning") {
    const sourcePath = path.join(workspaceRoot, request.cwd, "source.json");
    if (existsSync(sourcePath)) {
      const source = JSON.parse(readFileSync(sourcePath, "utf8"));
      if (!["approved", "spawned"].includes(source.status)) {
        source.status = "analyzed";
        writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}
`, "utf8");
      }
    }
    return;
  }
  if (request.entityType !== "project") {
    return;
  }
  const projectPath = path.join(workspaceRoot, request.cwd, "project.json");
  if (!existsSync(projectPath)) {
    return;
  }
  const project = JSON.parse(readFileSync(projectPath, "utf8"));
  project.workflow = project.workflow ?? {};
  switch (request.stage) {
    case "research":
      project.workflow.stage = "planning";
      break;
    case "plan":
      project.workflow.stage = "awaiting_plan_approval";
      break;
    case "edit":
      project.workflow.stage = "designing";
      break;
    case "design":
      project.workflow.stage = "designing";
      break;
    case "render-preview":
      project.workflow.stage = "qa";
      break;
  }
  writeFileSync(projectPath, `${JSON.stringify(project, null, 2)}
`, "utf8");
  const approvalsPath = project.paths?.approvals ? path.join(workspaceRoot, request.cwd, project.paths.approvals) : null;
  if (approvalsPath && existsSync(projectPath)) {
    mkdirSync(path.dirname(approvalsPath), { recursive: true });
    writeFileSync(
      approvalsPath,
      `${JSON.stringify(project.workflow.approvals ?? {}, null, 2)}
`,
      "utf8"
    );
  }
}
function buildStagePrompt(request) {
  const outputs = request.allowedOutputs.map((file) => `- ${path.posix.join(request.cwd.replace(/\\/g, "/"), file.replace(/\\/g, "/"))}`).join("\n");
  const note = request.userNote?.trim() ? `User note: ${request.userNote.trim()}
` : "";
  return [
    "You are running inside a temporary workspace copy for a Content OS desktop app.",
    "Follow the local workspace instructions and the stage skill file.",
    note,
    `Entity: ${request.entityType}:${request.entityId}`,
    `Stage: ${request.stage}`,
    `Skill file: ${request.skillPath ?? "none provided"}`,
    `Working entity directory: ${request.cwd.replace(/\\/g, "/")}`,
    "Allowed outputs:",
    outputs || "- none",
    "",
    "Requirements:",
    "- Read the relevant project/source files and the referenced skill before changing anything.",
    "- Edit only the allowed output files.",
    "- Keep the existing JSON/markdown contracts valid for this repository.",
    "- Do not rename files or introduce new output paths beyond the allowed list.",
    "- If the request cannot be completed safely, explain the blocker in the final message instead of editing unrelated files.",
    "",
    "Complete the stage task now.",
    ""
  ].join("\n");
}
function consumeCodexEvent(result, event) {
  const type = typeof event.type === "string" ? event.type : "unknown";
  if (type === "error" && typeof event.message === "string") {
    result.logs.push(createLog("error", event.message));
    return;
  }
  if (type === "item.completed" || type === "item.started") {
    const item = event.item;
    if (!item) {
      return;
    }
    if (item.type === "agent_message" && typeof item.text === "string") {
      result.lastMessage = item.text;
      result.logs.push(createLog("agent", item.text));
      return;
    }
    if (item.type === "command_execution") {
      const command = typeof item.command === "string" ? item.command : "command";
      const output = typeof item.aggregated_output === "string" ? item.aggregated_output.trim() : "";
      result.logs.push(createLog("command", output ? `${command}
${output}` : command));
      return;
    }
    if (item.type === "error" && typeof item.message === "string") {
      result.logs.push(createLog("error", item.message));
    }
  }
}
async function copyWorkspace(from, to) {
  await rm(to, { recursive: true, force: true });
  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to, {
    recursive: true,
    filter: (source) => {
      const normalized = normalizePath(source);
      return !(normalized.includes("/.git") || normalized.includes("/node_modules") || normalized.includes("/apps/desktop/dist") || normalized.includes("/apps/desktop/out"));
    }
  });
}
async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(absolutePath));
    } else {
      files.push(absolutePath);
    }
  }
  return files;
}
async function hashFile(absolutePath) {
  const buffer = await readFile(absolutePath);
  return createHash("sha256").update(buffer).digest("hex");
}
function isBinaryFile(filePath) {
  return BINARY_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}
function createLog(type, message) {
  return {
    id: randomUUID(),
    type,
    message,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function runProcess(command, args, cwd, allowNonZero) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: shouldUseShellForCommand(command),
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode !== 0 && !allowNonZero) {
        reject(new Error(stderr || stdout || `${command} exited with code ${exitCode}`));
        return;
      }
      resolve({ stdout, stderr, exitCode });
    });
  });
}
function shouldUseShellForCommand(command, platform = process.platform) {
  if (platform !== "win32") {
    return false;
  }
  const extension = path.extname(command).toLowerCase();
  return extension === ".cmd" || extension === ".bat";
}
function parseProviderStatusOutput(stdout, stderr) {
  const combined = stripAnsi(`${stdout}
${stderr}`).trim();
  const accountMatch = combined.match(/Logged in using\s+(.+)/i);
  if (accountMatch) {
    return {
      connected: true,
      accountLabel: accountMatch[1].trim(),
      message: combined
    };
  }
  if (/Logged in\b/i.test(combined)) {
    return {
      connected: true,
      message: combined
    };
  }
  return {
    connected: false,
    message: combined
  };
}
function stripAnsi(value) {
  return value.replace(/\u001B\[[0-9;]*m/g, "");
}
async function resolveCodexCommand() {
  if (process.platform === "win32") {
    const candidates = [];
    const appData = process.env.APPDATA;
    if (appData) {
      candidates.push(
        path.join(appData, "npm", "codex.cmd"),
        path.join(appData, "npm", "codex.ps1"),
        path.join(appData, "npm", "codex.exe"),
        path.join(appData, "npm", "codex")
      );
    }
    const whereResults = await Promise.all([
      runProcess("where.exe", ["codex.cmd"], process.cwd(), true),
      runProcess("where.exe", ["codex.exe"], process.cwd(), true),
      runProcess("where.exe", ["codex.ps1"], process.cwd(), true),
      runProcess("where.exe", ["codex"], process.cwd(), true)
    ]);
    for (const result of whereResults) {
      const matches = result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      candidates.push(...matches);
    }
    for (const candidate of candidates) {
      if (!candidate || !existsSync(candidate)) {
        continue;
      }
      const extension = path.extname(candidate).toLowerCase();
      if (extension === ".ps1") {
        return {
          command: "powershell.exe",
          baseArgs: ["-ExecutionPolicy", "Bypass", "-File", candidate]
        };
      }
      return {
        command: candidate,
        baseArgs: []
      };
    }
    throw new Error("Codex CLI was not found. Install it or add it to PATH. Expected codex.cmd under %APPDATA%\\npm.");
  }
  return {
    command: "codex",
    baseArgs: []
  };
}
function buildWindowsCommandLine(spec, args) {
  return [spec.command, ...spec.baseArgs, ...args].map(quoteWindowsArg).join(" ");
}
function quoteWindowsArg(value) {
  if (!/[\s"]/g.test(value)) {
    return value;
  }
  return `"${value.replace(/"/g, '\\"')}"`;
}
if (started) {
  app.quit();
}
let mainWindow = null;
async function createWindow() {
  const userDataPath = app.getPath("userData");
  const appStateStore = new AppStateStore(path.join(userDataPath, "content-os-state.json"));
  const defaultWorkspacePath = resolveDefaultWorkspacePath(appStateStore);
  const workspaceService = new WorkspaceService(defaultWorkspacePath, appStateStore);
  const runtimeService = new RuntimeService(userDataPath, appStateStore, workspaceService);
  await workspaceService.initialize();
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1e3,
    minWidth: 1280,
    minHeight: 840,
    backgroundColor: "#f8fafc",
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  registerIpc(mainWindow, workspaceService, runtimeService, appStateStore);
  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
function resolveDefaultWorkspacePath(appStateStore) {
  const storedWorkspace = appStateStore.getState().recentWorkspacePath;
  if (storedWorkspace) {
    return storedWorkspace;
  }
  if (process.env.CONTENT_OS_WORKSPACE) {
    return process.env.CONTENT_OS_WORKSPACE;
  }
  return path.resolve(app.getAppPath(), "..", "..");
}
app.whenReady().then(() => {
  void createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
