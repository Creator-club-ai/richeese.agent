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

    def test_brew_automation_emits_research_output_and_next_phase(self):
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
            research_artifact, templates = run_head_cycle.synthesize_research_artifacts(profile, "brew", "idea", completed)
            self.assertIsNotNone(research_artifact)
            self.assertTrue(research_artifact.exists())
            self.assertEqual(run_head_cycle.next_manual_phase(research_artifact), "analyze")
            self.assertIn("analyze", templates)
            self.assertTrue(templates["analyze"].exists())

    def test_no_artifact_keeps_next_phase_at_research(self):
        self.assertEqual(run_head_cycle.next_manual_phase(None), "research")


class EditorialMemoryStageTests(unittest.TestCase):
    def test_legacy_stage_aliases_normalize_to_public_phases(self):
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["brew"], "research")
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["planner"], "analyze")
        self.assertEqual(editorial_memory.PUBLIC_STAGE_ALIASES["editor"], "write")
        self.assertIn("research", editorial_memory.LOG_STAGE_CHOICES)
        self.assertIn("brew", editorial_memory.LOG_STAGE_CHOICES)


if __name__ == "__main__":
    unittest.main()
