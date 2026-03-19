import {
  Bot,
  FolderKanban,
  LayoutDashboard,
  Layers2,
  Logs,
  Palette,
  Settings2,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import type { WorkspaceSnapshot } from '@shared/types';
import { cn } from '@renderer/lib/utils';

export function Sidebar({ snapshot }: { snapshot: WorkspaceSnapshot }): React.JSX.Element {
  const items = [
    { to: '/', label: '대시보드', icon: LayoutDashboard },
    { to: '/intakes', label: '인테이크', icon: Layers2, count: snapshot.sources.length },
    { to: '/projects', label: '프로젝트', icon: FolderKanban, count: snapshot.projects.length },
    { to: '/catalog/brands', label: '브랜드', icon: Palette, count: snapshot.catalog.brands.length },
    { to: '/catalog/templates', label: '템플릿', icon: Layers2, count: snapshot.catalog.templates.length },
    { to: '/catalog/skills', label: '스킬', icon: Bot, count: snapshot.catalog.skills.length },
    { to: '/settings', label: '설정', icon: Settings2 },
    { to: '/logs', label: '로그', icon: Logs },
  ];

  return (
    <aside className="flex h-full flex-col rounded-[28px] border border-chrome-200/80 bg-white/90 p-5 shadow-editorial">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-chrome-900 text-white">
            CO
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink">Content OS</p>
            <p className="text-xs text-chrome-500">검수 중심 데스크톱 워크스페이스</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-chrome-900 text-white'
                  : 'text-chrome-600 hover:bg-chrome-100 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="flex items-center gap-3">
                  <item.icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-chrome-500')} />
                  {item.label}
                </span>
                {typeof item.count === 'number' ? (
                  <span className={cn('rounded-md px-2 py-0.5 text-[11px]', isActive ? 'bg-white/10' : 'bg-chrome-100 text-chrome-500')}>
                    {item.count}
                  </span>
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-chrome-200 bg-chrome-50 p-4">
        <p className="text-xs font-medium text-chrome-500">현재 워크플로우</p>
        <p className="mt-2 text-sm leading-6 text-chrome-700">
          실제 파일은 승인 후에만 반영됩니다. 초안 생성, diff 검토, 적용 순서로 진행됩니다.
        </p>
      </div>
    </aside>
  );
}
