import { create } from 'zustand';
import type {
  CommandResponse,
  ProjectCreatePayload,
  ProjectDetails,
  ProjectStatus,
  ProjectSummary,
  ReelJobDetails,
  ReelJobSummary,
  Tone,
  WorkspaceSummary,
} from '../lib/contracts';

type ActivityEntry = {
  id: string;
  title: string;
  detail: string;
  tone: Tone;
  createdAt: string;
};

type AppState = {
  workspace: WorkspaceSummary | null;
  projects: ProjectSummary[];
  reels: ReelJobSummary[];
  selectedProject: ProjectDetails | null;
  selectedReel: ReelJobDetails | null;
  selectedProjectId: string | null;
  selectedReelId: string | null;
  activity: ActivityEntry[];
  isBooting: boolean;
  isBusy: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  refreshAll: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  selectReel: (jobId: string) => Promise<void>;
  createProject: (payload: ProjectCreatePayload) => Promise<void>;
  saveProjectTextFile: (
    projectId: string,
    filename: string,
    content: string,
    options: { title: string; successDetail: string; statusOnSuccess?: ProjectStatus },
  ) => Promise<void>;
  saveSlidePlan: (projectId: string, markdown: string) => Promise<void>;
  markSlideAwaitingApproval: (projectId: string) => Promise<void>;
  approveSlidePlan: (projectId: string, approver: string) => Promise<void>;
  holdSlidePlan: (projectId: string, reason: string) => Promise<void>;
  renderSlideProject: (projectId: string) => Promise<void>;
  probeYoutube: (jobId: string, url: string) => Promise<void>;
  rankHighlights: (jobId: string) => Promise<void>;
  approveHighlight: (jobId: string, candidateIndex: number, approver: string) => Promise<void>;
  downloadApprovedHighlight: (jobId: string) => Promise<void>;
  renderShort: (jobId: string) => Promise<void>;
  openStudio: () => Promise<void>;
  openPath: (targetPath: string) => Promise<void>;
  readTextFile: (targetPath: string) => Promise<string>;
  resolveMediaUrl: (targetPath: string) => Promise<string>;
  clearError: () => void;
};

const getApi = () => {
  if (!window.marketingOps) {
    throw new Error(
      '\uc77c\ub809\ud2b8\ub860 preload API\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. \ub370\uc2a4\ud06c\ud1b1 \uc571\uc73c\ub85c \uc2e4\ud589\ud574 \uc8fc\uc138\uc694.',
    );
  }

  return window.marketingOps;
};

const makeActivity = (title: string, detail: string, tone: Tone): ActivityEntry => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title,
  detail,
  tone,
  createdAt: new Date().toISOString(),
});

const joinProjectFilePath = (projectPath: string, filename: string) => {
  const trimmed = projectPath.replace(/[\\/]+$/, '');
  return `${trimmed}\\${filename}`;
};

export const useAppStore = create<AppState>((set, get) => {
  const appendActivity = (title: string, detail: string, tone: Tone = 'neutral') => {
    set((state) => ({
      activity: [makeActivity(title, detail, tone), ...state.activity].slice(0, 24),
    }));
  };

  const withBusy = async <T>(title: string, work: () => Promise<T>, successDetail: (result: T) => string) => {
    set({ isBusy: true, error: null });

    try {
      const result = await work();
      appendActivity(title, successDetail(result), 'success');
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      appendActivity(title, message, 'danger');
      set({ error: message });
      throw error;
    } finally {
      set({ isBusy: false });
    }
  };

  const syncCollections = async () => {
    const api = getApi();
    const [workspace, projects, reels] = await Promise.all([
      api.system.getWorkspace(),
      api.projects.list(),
      api.reels.listJobs(),
    ]);

    set((state) => ({
      workspace,
      projects,
      reels,
      selectedProjectId: state.selectedProjectId ?? projects[0]?.id ?? null,
      selectedReelId: state.selectedReelId ?? reels[0]?.jobId ?? null,
    }));

    const nextProjectId = get().selectedProjectId;
    const nextReelId = get().selectedReelId;

    if (nextProjectId && projects.some((project) => project.id === nextProjectId)) {
      set({ selectedProject: await api.projects.get(nextProjectId) });
    } else {
      set({ selectedProject: null });
    }

    if (nextReelId && reels.some((reel) => reel.jobId === nextReelId)) {
      set({ selectedReel: await api.reels.getJob(nextReelId) });
    } else {
      set({ selectedReel: null });
    }
  };

  const refreshProjectSelection = async (projectId: string) => {
    const api = getApi();
    await syncCollections();
    const project = await api.projects.get(projectId);
    set({ selectedProjectId: projectId, selectedProject: project });
    return project;
  };

  const refreshReelSelection = async (jobId: string) => {
    const api = getApi();
    await syncCollections();
    const reel = await api.reels.getJob(jobId);
    set({ selectedReelId: jobId, selectedReel: reel });
    return reel;
  };

  return {
    workspace: null,
    projects: [],
    reels: [],
    selectedProject: null,
    selectedReel: null,
    selectedProjectId: null,
    selectedReelId: null,
    activity: [
      makeActivity(
        '\uc571 \uc900\ube44 \uc644\ub8cc',
        '\ub85c\uceec \uc791\uc5c5 \uacf5\uac04\uc744 \ubd88\ub7ec\uc62c \uc900\ube44\uac00 \ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
        'accent',
      ),
    ],
    isBooting: false,
    isBusy: false,
    error: null,
    bootstrap: async () => {
      set({ isBooting: true, error: null });

      try {
        await syncCollections();
        appendActivity(
          '\uc791\uc5c5 \uacf5\uac04 \ub85c\ub4dc \uc644\ub8cc',
          '\ud504\ub85c\uc81d\ud2b8\uc640 \ub9b4\uc2a4 \uc0c1\ud0dc\ub97c \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4.',
          'accent',
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        set({ error: message });
        appendActivity('\ucd08\uae30 \ub85c\ub529 \uc2e4\ud328', message, 'danger');
      } finally {
        set({ isBooting: false });
      }
    },
    refreshAll: async () => {
      await withBusy(
        '\uc791\uc5c5 \uacf5\uac04 \uc0c8\ub85c\uace0\uce68',
        async () => {
          await syncCollections();
          return true;
        },
        () => '\ucd5c\uc2e0 \ud30c\uc77c\uacfc \uc2b9\uc778 \uc0c1\ud0dc\ub97c \ub2e4\uc2dc \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4.',
      );
    },
    selectProject: async (projectId: string) => {
      const api = getApi();
      set({ selectedProjectId: projectId, error: null });
      const project = await api.projects.get(projectId);
      set({ selectedProject: project });
    },
    selectReel: async (jobId: string) => {
      const api = getApi();
      set({ selectedReelId: jobId, error: null });
      const reel = await api.reels.getJob(jobId);
      set({ selectedReel: reel });
    },
    createProject: async (payload) => {
      await withBusy(
        '\ud504\ub85c\uc81d\ud2b8 \uc0dd\uc131',
        async () => {
          const api = getApi();
          const project = await api.projects.create(payload);
          await refreshProjectSelection(project.id);
          return project;
        },
        (project) => `${project.title} \ud504\ub85c\uc81d\ud2b8\ub97c \uc0dd\uc131\ud588\uc2b5\ub2c8\ub2e4.`,
      );
    },
    saveProjectTextFile: async (projectId, filename, content, options) => {
      await withBusy(
        options.title,
        async () => {
          const api = getApi();
          const project = await api.projects.get(projectId);
          const targetPath = joinProjectFilePath(project.path, filename);
          await api.files.writeText({ path: targetPath, content });

          if (options.statusOnSuccess) {
            await api.projects.updateMeta(projectId, { status: options.statusOnSuccess });
          }

          return refreshProjectSelection(projectId);
        },
        () => options.successDetail,
      );
    },
    saveSlidePlan: async (projectId, markdown) => {
      await withBusy(
        '\uc2ac\ub77c\uc774\ub4dc \ud50c\ub79c \uc800\uc7a5',
        async () => {
          const api = getApi();
          await api.slides.createPlan(projectId, { markdown });
          return refreshProjectSelection(projectId);
        },
        () => '\uc2ac\ub77c\uc774\ub4dc \ud50c\ub79c\uc744 \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4.',
      );
    },
    markSlideAwaitingApproval: async (projectId) => {
      await withBusy(
        '\ud50c\ub79c \uc2b9\uc778 \uc694\uccad',
        async () => {
          const api = getApi();
          await api.slides.markAwaitingApproval(projectId);
          return refreshProjectSelection(projectId);
        },
        () => '\uc2ac\ub77c\uc774\ub4dc \ud50c\ub79c\uc744 \uc2b9\uc778 \ub300\uae30 \uc0c1\ud0dc\ub85c \ubcc0\uacbd\ud588\uc2b5\ub2c8\ub2e4.',
      );
    },
    approveSlidePlan: async (projectId, approver) => {
      await withBusy(
        '\ud50c\ub79c \uc2b9\uc778',
        async () => {
          const api = getApi();
          await api.slides.approvePlan(projectId, approver);
          return refreshProjectSelection(projectId);
        },
        () => `${approver} \uc774 \uc2ac\ub77c\uc774\ub4dc \ud50c\ub79c\uc744 \uc2b9\uc778\ud588\uc2b5\ub2c8\ub2e4.`,
      );
    },
    holdSlidePlan: async (projectId, reason) => {
      await withBusy(
        '\ud50c\ub79c \ubcf4\ub958',
        async () => {
          const api = getApi();
          await api.slides.holdPlan(projectId, reason);
          return refreshProjectSelection(projectId);
        },
        () => `\uc2ac\ub77c\uc774\ub4dc \ud50c\ub79c\uc744 \ubcf4\ub958 \uc0c1\ud0dc\ub85c \ubcc0\uacbd\ud588\uc2b5\ub2c8\ub2e4. ${
          reason || ''
        }`.trim(),
      );
    },
    renderSlideProject: async (projectId) => {
      await withBusy(
        '\uc2ac\ub77c\uc774\ub4dc \ub80c\ub354',
        async () => {
          const api = getApi();
          await api.slides.renderProject(projectId);
          return refreshProjectSelection(projectId);
        },
        (project) =>
          project.renderAssets.length > 0
            ? `${project.renderAssets.length}\uc7a5\uc758 \uc2ac\ub77c\uc774\ub4dc \uc774\ubbf8\uc9c0\ub97c \uc0dd\uc131\ud588\uc2b5\ub2c8\ub2e4.`
            : '\uc2ac\ub77c\uc774\ub4dc \ub80c\ub354\ub97c \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4.',
      );
    },
    probeYoutube: async (jobId, url) => {
      await withBusy(
        '\uc720\ud29c\ube0c \uc18c\uc2a4 \ubd84\uc11d',
        async () => {
          const api = getApi();
          await api.reels.probeYoutube(jobId, url);
          return refreshReelSelection(jobId);
        },
        (reel) => `${reel.title} \ubd84\uc11d\uc744 \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4.`,
      );
    },
    rankHighlights: async (jobId) => {
      await withBusy(
        '\ud558\uc774\ub77c\uc774\ud2b8 \uc815\ub82c',
        async () => {
          const api = getApi();
          await api.reels.rankHighlights(jobId);
          return refreshReelSelection(jobId);
        },
        (reel) => `${reel.topCandidates.length}\uac1c\uc758 \ud6c4\ubcf4 \ud074\ub9bd\uc744 \uac80\ud1a0\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.`,
      );
    },
    approveHighlight: async (jobId, candidateIndex, approver) => {
      await withBusy(
        '\ud558\uc774\ub77c\uc774\ud2b8 \uc2b9\uc778',
        async () => {
          const api = getApi();
          await api.reels.approveHighlight(jobId, candidateIndex, approver);
          return refreshReelSelection(jobId);
        },
        (reel) =>
          `${approver} \uc774 \ud6c4\ubcf4 ${reel.approvedCandidateIndex ?? candidateIndex}\ubc88\uc744 \uc2b9\uc778\ud588\uc2b5\ub2c8\ub2e4.`,
      );
    },
    downloadApprovedHighlight: async (jobId) => {
      await withBusy(
        '\uc2b9\uc778 \ud074\ub9bd \ub2e4\uc6b4\ub85c\ub4dc',
        async () => {
          const api = getApi();
          await api.reels.downloadApprovedHighlight(jobId);
          return refreshReelSelection(jobId);
        },
        (reel) => `${reel.title} \ud074\ub9bd \ub2e4\uc6b4\ub85c\ub4dc\ub97c \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4.`,
      );
    },
    renderShort: async (jobId) => {
      await withBusy(
        '\uc1fc\uce20 \ub80c\ub354',
        async () => {
          const api = getApi();
          await api.reels.renderShort(jobId);
          return refreshReelSelection(jobId);
        },
        (reel) => `${reel.renderedOutputPath ?? '\uae30\ubcf8 \ucd9c\ub825 \ud3f4\ub354'}\uc5d0 \uacb0\uacfc\uac00 \uc0dd\uc131\ub418\uc5c8\uc2b5\ub2c8\ub2e4.`,
      );
    },
    openStudio: async () => {
      await withBusy(
        '\ub9ac\ubaa8\uc158 \uc2a4\ud29c\ub514\uc624 \uc2e4\ud589',
        async () => {
          const api = getApi();
          return api.reels.openStudio();
        },
        (result: CommandResponse) => result.message,
      );
    },
    openPath: async (targetPath: string) => {
      await withBusy(
        '\uacbd\ub85c \uc5f4\uae30',
        async () => {
          const api = getApi();
          return api.system.openPath(targetPath);
        },
        (result: CommandResponse) => result.path ?? result.message,
      );
    },
    readTextFile: async (targetPath: string) => {
      const api = getApi();
      return api.files.readText(targetPath);
    },
    resolveMediaUrl: async (targetPath: string) => {
      const api = getApi();
      return api.system.resolveMediaUrl(targetPath);
    },
    clearError: () => set({ error: null }),
  };
});
