import { HashRouter, Route, Routes } from 'react-router-dom';
import { toast, Toaster } from 'sonner';

import { Sidebar } from '@renderer/components/layout/sidebar';
import { TopBar } from '@renderer/components/layout/top-bar';
import { DashboardPage } from '@renderer/pages/dashboard-page';
import { EntityBoardPage } from '@renderer/pages/entity-board-page';
import { CatalogPage } from '@renderer/pages/catalog-page';
import { SettingsPage } from '@renderer/pages/settings-page';
import { LogsPage } from '@renderer/pages/logs-page';
import { WorkbenchPage } from '@renderer/pages/workbench-page';
import { useContentOS } from '@renderer/hooks/use-content-os';
import { mergeRunSummaries } from '@renderer/lib/workspace';

function AppShell(): React.JSX.Element {
  const contentOS = useContentOS();

  if (contentOS.isLoading || !contentOS.snapshot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.1),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-6">
        <div className="w-full max-w-md rounded-[28px] border border-chrome-200/90 bg-white/95 p-8 shadow-editorial">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-chrome-500">Content OS</p>
          <h1 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
            워크스페이스를 준비하는 중입니다
          </h1>
          <p className="mt-2 text-sm leading-6 text-chrome-600">
            로컬 파일, 최근 실행 기록, Codex 연결 상태를 불러오고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.1),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.06),_transparent_18%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-ink">
      <div className="mx-auto grid min-h-screen max-w-[1920px] grid-cols-[280px_1fr] gap-5 p-5">
        <Sidebar snapshot={contentOS.snapshot} />
        <div className="flex min-h-0 flex-col gap-6">
          <TopBar
            snapshot={contentOS.snapshot}
            providerStatus={contentOS.providerStatus}
            onChooseWorkspace={async () => {
              try {
                await contentOS.chooseWorkspacePath();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : String(error));
              }
            }}
            onConnectProvider={async () => {
              try {
                await contentOS.connectProvider();
                toast.message('로그인 창을 열었습니다. 인증 후 연결 상태를 새로고침해 주세요.');
              } catch (error) {
                toast.error(error instanceof Error ? error.message : String(error));
              }
            }}
            onRefreshProvider={async () => {
              try {
                await contentOS.refreshProviderStatus();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : String(error));
              }
            }}
          />
          <main className="min-h-0 flex-1 overflow-hidden rounded-[32px] border border-white/70 bg-white/45 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    snapshot={contentOS.snapshot}
                    providerStatus={contentOS.providerStatus}
                    runs={mergeRunSummaries(contentOS.appState?.runs ?? [], contentOS.runs)}
                  />
                }
              />
              <Route
                path="/intakes"
                element={
                  <EntityBoardPage
                    title="인테이크 보드"
                    description="수집된 소스를 검토하고 승인 대기열을 정리합니다."
                    entities={contentOS.snapshot.sources}
                    groupByKey="status"
                  />
                }
              />
              <Route
                path="/projects"
                element={
                  <EntityBoardPage
                    title="프로젝트 보드"
                    description="리서치부터 QA까지 각 단계를 직접 검수하며 진행합니다."
                    entities={contentOS.snapshot.projects}
                    groupByKey="stage"
                  />
                }
              />
              <Route path="/workbench/:entityType/:entityId" element={<WorkbenchPage contentOS={contentOS} />} />
              <Route path="/catalog/:catalogKey" element={<CatalogPage contentOS={contentOS} />} />
              <Route path="/settings" element={<SettingsPage contentOS={contentOS} />} />
              <Route path="/logs" element={<LogsPage appState={contentOS.appState} runs={contentOS.runs} />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster richColors theme="light" position="top-right" />
    </div>
  );
}

export default function App(): React.JSX.Element {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}
