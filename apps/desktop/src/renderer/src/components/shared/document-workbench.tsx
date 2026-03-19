import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

import { parseMarkdownSections } from '@shared/parsers';
import type { WorkspaceDocument } from '@shared/types';
import { Button } from '@renderer/components/ui/button';
import { ScrollArea } from '@renderer/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs';
import { Textarea } from '@renderer/components/ui/textarea';
import { safePrettyJson } from '@renderer/lib/workspace';
import { EmptyState } from './empty-state';

export function DocumentWorkbench({
  document,
  onRead,
  onSave,
  onOpenPath,
}: {
  document: WorkspaceDocument;
  onRead: (absolutePath: string) => Promise<string>;
  onSave: (payload: { absolutePath: string; content: string }) => Promise<void>;
  onOpenPath: (targetPath: string) => Promise<void>;
}): React.JSX.Element {
  const [content, setContent] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      setLoading(true);
      if (!document.exists) {
        if (!disposed) {
          setContent('');
          setDraft('');
          setLoading(false);
        }
        return;
      }

      const nextContent = await onRead(document.absolutePath);
      if (disposed) {
        return;
      }
      setContent(nextContent);
      setDraft(nextContent);
      setLoading(false);
    };

    void load();

    return () => {
      disposed = true;
    };
  }, [document, onRead]);

  const sections = parseMarkdownSections(content);

  return (
    <Tabs defaultValue="structured">
      <div className="flex items-center justify-between gap-4">
        <TabsList>
          <TabsTrigger value="structured">구조 보기</TabsTrigger>
          <TabsTrigger value="raw">원문 편집</TabsTrigger>
        </TabsList>
        <Button variant="ghost" size="sm" onClick={() => void onOpenPath(document.absolutePath)}>
          폴더에서 열기
        </Button>
      </div>

      <TabsContent value="structured">
        <div className="rounded-2xl border border-chrome-200 bg-chrome-50/60 p-4">
          {loading ? (
            <EmptyState label="문서를 불러오는 중입니다" detail="현재 워크스페이스에서 파일 내용을 읽고 있습니다." />
          ) : document.relativePath.endsWith('.json') ? (
            <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-xs text-chrome-800">
              {safePrettyJson(content)}
            </pre>
          ) : sections.length === 0 ? (
            <div className="prose prose-sm max-w-none rounded-xl bg-white p-5">
              <ReactMarkdown>{content || '_내용이 없습니다._'}</ReactMarkdown>
            </div>
          ) : (
            <ScrollArea className="h-[420px] pr-3">
              <div className="space-y-3">
                {sections.map((section) => (
                  <div key={`${section.level}-${section.heading}`} className="rounded-xl border border-chrome-200 bg-white p-4">
                    <p className="text-xs font-medium text-chrome-400">H{section.level}</p>
                    <h4 className="mt-2 text-lg font-semibold text-ink">{section.heading}</h4>
                    <div className="prose prose-sm mt-3 max-w-none">
                      <ReactMarkdown>{section.content || '_본문이 없습니다._'}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </TabsContent>

      <TabsContent value="raw">
        <div className="space-y-3">
          <Textarea
            className="min-h-[420px] font-mono text-xs"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="accent"
              onClick={() =>
                void onSave({ absolutePath: document.absolutePath, content: draft })
                  .then(() => {
                    setContent(draft);
                    toast.success('파일을 저장했습니다.');
                  })
                  .catch((error) => {
                    toast.error(error instanceof Error ? error.message : String(error));
                  })
              }
            >
              저장
            </Button>
            <Button variant="secondary" onClick={() => setDraft(content)}>
              되돌리기
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
