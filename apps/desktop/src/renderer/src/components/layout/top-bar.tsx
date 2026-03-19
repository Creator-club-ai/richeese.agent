import { FolderOpen, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import type { ProviderStatus, WorkspaceSnapshot } from '@shared/types';
import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { resolvePageTitle } from '@renderer/lib/workspace';

export function TopBar({
  snapshot,
  providerStatus,
  onChooseWorkspace,
  onConnectProvider,
  onRefreshProvider,
}: {
  snapshot: WorkspaceSnapshot;
  providerStatus: ProviderStatus | null;
  onChooseWorkspace: () => Promise<void>;
  onConnectProvider: () => Promise<void>;
  onRefreshProvider: () => Promise<void>;
}): React.JSX.Element {
  const location = useLocation();
  const pageTitle = resolvePageTitle(location.pathname);

  return (
    <header className="grid grid-cols-[minmax(0,1fr)_360px] gap-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-chrome-500">
                <Sparkles className="h-4 w-4" />
                수동 검수 중심 운영 화면
              </div>
              <CardTitle className="text-3xl">{pageTitle}</CardTitle>
              <CardDescription className="mt-2 max-w-3xl">
                현재 워크스페이스 경로를 기준으로 소스, 프로젝트, 스킬, 템플릿을 읽어옵니다.
              </CardDescription>
            </div>
            <Button variant="secondary" onClick={() => void onChooseWorkspace()}>
              <FolderOpen className="h-4 w-4" />
              워크스페이스 변경
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-chrome-200 bg-chrome-50 px-4 py-3 text-sm text-chrome-600">
            {snapshot.workspacePath}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-xl">OpenAI / Codex 연결</CardTitle>
            <Badge variant={providerStatus?.connected ? 'success' : 'warning'}>
              {providerStatus?.connected ? '연결됨' : '확인 필요'}
            </Badge>
          </div>
          <CardDescription>
            {providerStatus?.connected
              ? `${providerStatus.accountLabel ?? 'ChatGPT'} 계정으로 연결되어 있습니다.`
              : '로컬 Codex 로그인 상태를 확인해 주세요.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {providerStatus?.error && !providerStatus.connected ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {providerStatus.error}
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button variant="accent" className="flex-1" onClick={() => void onConnectProvider()}>
              로그인 열기
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => void onRefreshProvider()}>
              상태 새로고침
            </Button>
          </div>
        </CardContent>
      </Card>
    </header>
  );
}
