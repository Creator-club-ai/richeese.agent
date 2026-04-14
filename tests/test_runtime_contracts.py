import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = REPO_ROOT / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))


def load_module(module_name: str, relative_path: str):
    module_path = REPO_ROOT / relative_path
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


run_head_cycle = load_module("run_head_cycle", "scripts/run_head_cycle.py")
editorial_memory = load_module("editorial_memory", "scripts/editorial_memory.py")
fetch_and_curate = load_module("fetch_and_curate", "scripts/fetch_and_curate.py")


class HeadRunnerContractTests(unittest.TestCase):
    def _fake_profile(self, root: Path):
        return run_head_cycle.RuntimeProfile(
            active_profile="richesse-club",
            profile_root=root / "brands" / "richesse-club",
            runtime_profile=root / "brands" / "richesse-club" / "RUNTIME_PROFILE.md",
            brand_guide=root / "brands" / "richesse-club" / "BRAND_GUIDE.md",
            content_strategy=root / "brands" / "richesse-club" / "CONTENT_STRATEGY.md",
            vault_path=root / "vault",
            raw_dir=root / "vault" / "raw",
            latest_signals_dir=root / "vault" / "오늘의 뉴스",
            wiki_dir=root / "vault" / "wiki",
            editorial_memory_dir=root / "vault" / "wiki" / "editorial-memory",
            working_cards_dir=root / "vault" / "content" / "instagram",
            head_artifacts_dir=root / "vault" / "wiki" / "editorial-memory" / "head-artifacts",
        )

    def test_signals_automation_stops_at_discovery_shortlist(self):
        with tempfile.TemporaryDirectory() as tmp:
            profile = self._fake_profile(Path(tmp))
            completed = run_head_cycle.subprocess.CompletedProcess(
                args=["python", "scripts/fetch_and_curate.py"],
                returncode=0,
                stdout=(
                    "LATEST_SIGNALS_JSON_PATH: C:\\temp\\signals.json\n"
                    "--- NEW_ARTICLES_START ---\n"
                    '[{"title":"Signal A","url":"https://example.com/a","source":"TechCrunch","category":"Business"}]\n'
                    "--- NEW_ARTICLES_END ---\n"
                ),
                stderr="",
            )
            research_artifact, templates = run_head_cycle.synthesize_research_artifacts(profile, "signals", "idea", completed)
            self.assertIsNone(research_artifact)
            self.assertEqual(run_head_cycle.next_manual_phase(research_artifact), "research")
            self.assertEqual(templates, {})

    def test_auto_mode_without_source_resolves_to_signals(self):
        self.assertEqual(run_head_cycle.resolve_run_mode("auto", None), "signals")

    def test_legacy_brew_mode_alias_resolves_to_signals(self):
        self.assertEqual(run_head_cycle.resolve_run_mode("brew", None), "signals")

    def test_default_auto_signals_path_stops_before_research_contract(self):
        with tempfile.TemporaryDirectory() as tmp:
            profile = self._fake_profile(Path(tmp))
            completed = run_head_cycle.subprocess.CompletedProcess(
                args=["python", "scripts/fetch_and_curate.py"],
                returncode=0,
                stdout=(
                    "LATEST_SIGNALS_JSON_PATH: C:\\temp\\signals.json\n"
                    "--- NEW_ARTICLES_START ---\n"
                    '[{"title":"Signal A","url":"https://example.com/a","source":"TechCrunch","category":"Business"}]\n'
                    "--- NEW_ARTICLES_END ---\n"
                ),
                stderr="",
            )
            run_mode = run_head_cycle.resolve_run_mode("auto", None)
            research_artifact, templates = run_head_cycle.synthesize_research_artifacts(profile, run_mode, "idea", completed)
            self.assertIsNone(research_artifact)
            self.assertEqual(templates, {})

    def test_no_artifact_keeps_next_phase_at_research(self):
        self.assertEqual(run_head_cycle.next_manual_phase(None), "research")


class PhaseArtifactContractTests(unittest.TestCase):
    def _fake_profile(self, root: Path):
        return run_head_cycle.RuntimeProfile(
            active_profile="richesse-club",
            profile_root=root / "brands" / "richesse-club",
            runtime_profile=root / "brands" / "richesse-club" / "RUNTIME_PROFILE.md",
            brand_guide=root / "brands" / "richesse-club" / "BRAND_GUIDE.md",
            content_strategy=root / "brands" / "richesse-club" / "CONTENT_STRATEGY.md",
            vault_path=root / "vault",
            raw_dir=root / "vault" / "raw",
            latest_signals_dir=root / "vault" / "오늘의 뉴스",
            wiki_dir=root / "vault" / "wiki",
            editorial_memory_dir=root / "vault" / "wiki" / "editorial-memory",
            working_cards_dir=root / "vault" / "content" / "instagram",
            head_artifacts_dir=root / "vault" / "wiki" / "editorial-memory" / "head-artifacts",
        )

    def test_follow_on_templates_use_public_contract_names(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            profile = self._fake_profile(root)
            run = run_head_cycle.create_phase_run(profile, "signal-a")
            research_artifact = run_head_cycle.write_research_output(
                run,
                profile.active_profile,
                "Signal A",
                "signals",
                {
                    "Topic": "Signal A",
                    "Research Depth": "shallow",
                    "Source Inventory": "- source",
                    "What Happened": "something happened",
                    "Usable Points": "- point",
                    "Direction Cues": "- cue",
                    "Risks or Gaps": "- gap",
                    "Source Strength": "usable",
                    "Fact Risk": "medium",
                },
                "hand off to analyze",
            )
            templates = run_head_cycle.scaffold_follow_on_templates(
                run,
                profile.active_profile,
                research_artifact,
                phases=("review", "refine"),
            )
            review_text = templates["review"].read_text(encoding="utf-8")
            refine_text = templates["refine"].read_text(encoding="utf-8")
            self.assertIn('artifact_type: "ReviewVerdict"', review_text)
            self.assertIn('artifact_type: "RepairRequest"', refine_text)


class EditorialMemoryStageTests(unittest.TestCase):
    def test_legacy_stage_aliases_normalize_to_public_phases(self):
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["signals"], "research")
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["brew"], "research")
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["planner"], "analyze")
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["editor"], "write")
        self.assertIn("research", editorial_memory.LOG_STAGE_CHOICES)
        self.assertIn("signals", editorial_memory.LOG_STAGE_CHOICES)
        self.assertIn("brew", editorial_memory.LOG_STAGE_CHOICES)

    def test_captured_verdict_does_not_count_as_approval_signal(self):
        snapshot = editorial_memory.build_snapshot(
            [],
            [
                {
                    "timestamp": "2026-04-14T00:00:00+00:00",
                    "stage": "research",
                    "verdict": "captured",
                    "title": "Signal A",
                    "tags": ["raw-capture"],
                    "route": "analyze",
                }
            ],
            5,
        )
        self.assertIn("no approval tags logged yet", snapshot)
        self.assertNotIn("- raw-capture: 1", snapshot)


class DiscoveryCollectorTests(unittest.TestCase):
    def test_build_new_shortlist_deduplicates_and_filters_existing_keys(self):
        articles = [
            {
                "title": "AI Strategy Shift",
                "url": "https://example.com/a?utm_source=x",
                "source": "Source A",
                "priority": 1,
                "summary": "",
                "type": "rss",
            },
            {
                "title": "AI Strategy Shift",
                "url": "https://example.com/a",
                "source": "Source B",
                "priority": 2,
                "summary": "",
                "type": "google_news",
            },
            {
                "title": "Capital Moves",
                "url": "https://example.com/b",
                "source": "Source C",
                "priority": 1,
                "summary": "",
                "type": "rss",
            },
        ]
        existing_keys = set(fetch_and_curate.article_keys({"title": "Capital Moves", "url": "https://example.com/b"}))
        shortlist, removed = fetch_and_curate.build_new_shortlist(articles, existing_keys)
        self.assertEqual(len(shortlist), 1)
        self.assertEqual(shortlist[0]["title"], "AI Strategy Shift")
        self.assertEqual(removed, 2)


if __name__ == "__main__":
    unittest.main()
