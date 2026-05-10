from pathlib import Path
from pydantic_ai.models_openrouter import OpenRouterModel

MODEL = OpenRouterModel(
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free,"
)