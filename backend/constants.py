from pathlib import Path
from pydantic_ai.models_openrouter import OpenRouterModel
from pydantic import BaseModel

class FoodResult(BaseModel):
    name_food: str
    calories: int
    ingredient: list
    recipe:str
    protein: int
    fat: int


MODEL = OpenRouterModel(
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free,"
)