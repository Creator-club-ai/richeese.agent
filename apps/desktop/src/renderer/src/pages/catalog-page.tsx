import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { WorkspaceFileEntry } from '@shared/types';
import { DocumentWorkbench } from '@renderer/components/shared/document-workbench';
import { EmptyState } from '@renderer/components/shared/empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { ScrollArea } from '@renderer/components/ui/scroll-area';
import { cn } from '@renderer/lib/utils';
import { useContentOS } from '@renderer/hooks/use-content-os';
import { translateCatalogKey } from '@renderer/lib/workspace';

export function CatalogPage({
  contentOS,
}: {
  contentOS: ReturnType<typeof useContentOS>;
}): React.JSX.Element {
  const { catalogKey } = useParams();
  const catalog = catalogKey === 'brands'
    ? contentOS.snapshot?.catalog.brands
    : catalogKey === 'templates'
      ? contentOS.snapshot?.catalog.templates
      : contentOS.snapshot?.catalog.skills;

  const [selectedFile, setSelectedFile] = useState<WorkspaceFileEntry | null>(catalog?.[0] ?? null);

  useEffect(() => {
    setSelectedFile(catalog?.[0] ?? null);
  }, [catalog]);

  return (
    <div className="grid h-full grid-cols-[320px_minmax(0,1fr)] gap-6">
      <Card className="min-h-0">
        <CardHeader>
          <CardTitle>{translateCatalogKey(catalogKey)}</CardTitle>
          <CardDescription>워크스페이스에 저장된 가이드, 템플릿, 스킬 파일을 확인하고 편집합니다.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-0">
          <ScrollArea className="h-[calc(100vh-260px)] pr-3">
            <div className="space-y-3">
              {(catalog ?? []).map((file) => (
                <button
                  key={file.absolutePath}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-colors',
                    selectedFile?.absolutePath === file.absolutePath
                      ? 'border-chrome-900 bg-chrome-900 text-white'
                      : 'border-chrome-200 bg-chrome-50/60 text-ink hover:bg-chrome-100',
                  )}
                >
                  <p className="font-medium">{file.name}</p>
                  <p className={cn('mt-2 text-sm', selectedFile?.absolutePath === file.absolutePath ? 'text-chrome-200' : 'text-chrome-500')}>
                    {file.relativePath}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="min-h-0">
        <CardHeader>
          <CardTitle>{selectedFile?.name ?? '파일을 선택해 주세요'}</CardTitle>
          <CardDescription>{selectedFile?.absolutePath}</CardDescription>
        </CardHeader>
        <CardContent className="min-h-0">
          {selectedFile ? (
            <DocumentWorkbench
              document={{
                key: selectedFile.id,
                label: selectedFile.name,
                absolutePath: selectedFile.absolutePath,
                relativePath: selectedFile.relativePath,
                exists: true,
                preview: '',
              }}
              onRead={contentOS.readFile}
              onSave={contentOS.saveFile}
              onOpenPath={contentOS.openPath}
            />
          ) : (
            <EmptyState label="선택된 파일이 없습니다" detail="왼쪽 목록에서 파일을 선택해 주세요." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
