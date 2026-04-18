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


profile_runtime = load_module("profile_runtime", "scripts/profile_runtime.py")
phase_artifacts = load_module("phase_artifacts", "scripts/phase_artifacts.py")
editorial_memory = load_module("editorial_memory", "scripts/editorial_memory.py")
fetch_and_curate = load_module("fetch_and_curate", "scripts/fetch_and_curate.py")
from signal_adapters import runtime as adapter_runtime


class PhaseArtifactContractTests(unittest.TestCase):
    def _fake_profile(self, root: Path):
        return profile_runtime.RuntimeProfile(
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
            working_cards_dir=root / "vault" / "content" / "instagram" / "drafts",
            head_artifacts_dir=root / "vault" / "wiki" / "editorial-memory" / "head-artifacts",
        )

    def test_follow_on_templates_use_public_contract_names(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            profile = self._fake_profile(root)
            run = phase_artifacts.create_phase_run(profile, "signal-a")
            research_artifact = phase_artifacts.write_research_output(
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
                "send to content-os-planner",
            )
            templates = phase_artifacts.scaffold_follow_on_templates(
                run,
                profile.active_profile,
                research_artifact,
                phases=("planner", "writer"),
            )
            planner_text = templates["planner"].read_text(encoding="utf-8")
            writer_text = templates["writer"].read_text(encoding="utf-8")
            self.assertIn('artifact_type: "PlanOutput"', planner_text)
            self.assertIn('artifact_type: "CopyOutput"', writer_text)


class EditorialMemoryStageTests(unittest.TestCase):
    def test_legacy_stage_aliases_normalize_to_public_phases(self):
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["signals"], "news")
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["brew"], "news")
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["analyze"], "planner")
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["editor"], "writer")
        self.assertIn("research", editorial_memory.LOG_STAGE_CHOICES)
        self.assertIn("news", editorial_memory.LOG_STAGE_CHOICES)
        self.assertIn("signals", editorial_memory.LOG_STAGE_CHOICES)
        self.assertIn("brew", editorial_memory.LOG_STAGE_CHOICES)

    def test_captured_verdict_does_not_count_as_approval_signal(self):
        snapshot = editorial_memory.build_snapshot(
            [],
            [
                {
                    "timestamp": "2026-04-14T00:00:00+00:00",
                    "stage": "news",
                    "verdict": "captured",
                    "title": "Signal A",
                    "tags": ["raw-capture"],
                    "route": "planner",
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

    def test_build_new_shortlist_filters_before_saving(self):
        articles = [
            {
                "title": "AI startup pricing shift",
                "url": "https://example.com/keep",
                "source": "Source A",
                "priority": 1,
                "summary": "A founder changes the business model.",
                "category": "Business",
            },
            {
                "title": "Celebrity tennis playoff gossip",
                "url": "https://example.com/drop",
                "source": "Source B",
                "priority": 1,
                "summary": "Entertainment recap.",
                "category": "Sports",
            },
        ]
        config = fetch_and_curate.FilterConfig(
            include_keywords=("startup", "founder"),
            exclude_keywords=("celebrity",),
            allowed_categories=("business",),
            max_items=10,
        )
        shortlist, removed = fetch_and_curate.build_new_shortlist(articles, set(), config)
        self.assertEqual([article["title"] for article in shortlist], ["AI startup pricing shift"])
        self.assertEqual(removed, 1)

    def test_lookback_days_is_clamped(self):
        original = adapter_runtime.os.environ.get("CONTENT_OS_LOOKBACK_DAYS")
        try:
            adapter_runtime.os.environ["CONTENT_OS_LOOKBACK_DAYS"] = "99"
            self.assertEqual(adapter_runtime.lookback_days(), 4)
            adapter_runtime.os.environ["CONTENT_OS_LOOKBACK_DAYS"] = "0"
            self.assertEqual(adapter_runtime.lookback_days(), 1)
        finally:
            if original is None:
                adapter_runtime.os.environ.pop("CONTENT_OS_LOOKBACK_DAYS", None)
            else:
                adapter_runtime.os.environ["CONTENT_OS_LOOKBACK_DAYS"] = original


if __name__ == "__main__":
    unittest.main()
