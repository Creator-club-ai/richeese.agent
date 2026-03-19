import { Badge } from '@renderer/components/ui/badge';
import { Button } from '@renderer/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { useContentOS } from '@renderer/hooks/use-content-os';

export function SettingsPage({
  contentOS,
}: {
  contentOS: ReturnType<typeof useContentOS>;
}): React.JSX.Element {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>워크스페이스 설정</CardTitle>
          <CardDescription>현재 열려 있는 루트 경로와 검증 동작을 확인합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-chrome-200 bg-chrome-50/60 p-4 text-sm text-chrome-600">
            {contentOS.snapshot?.workspacePath}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => void contentOS.chooseWorkspacePath()}>
              경로 변경
            </Button>
            <Button variant="ghost" onClick={() => void contentOS.refreshValidation()}>
              검증 다시 실행
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>연결 설정</CardTitle>
          <CardDescription>로컬 Codex / ChatGPT 로그인 상태를 기준으로 AI 단계를 실행합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant={contentOS.providerStatus?.connected ? 'success' : 'warning'}>
            {contentOS.providerStatus?.connected ? '연결됨' : '연결 안 됨'}
          </Badge>
          <div className="flex gap-2">
            <Button variant="accent" onClick={() => void contentOS.connectProvider()}>
              로그인 열기
            </Button>
            <Button variant="secondary" onClick={() => void contentOS.refreshProviderStatus()}>
              상태 확인
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
