from pydantic_ai import Agent
from dotenv import load_dotenv
from backend.constants import MODEL

load_dotenv()

class FoodResult(BaseModel):
    name_food: str
    calories: int
    ingredient: list
    recipe:str
    protein: int
    fat: int

food_agent = Agent(
    model = MODEL,
    system_prompt=(
        "You are a intelligent and smart scanner"
    )output_type=FoodResult,
)