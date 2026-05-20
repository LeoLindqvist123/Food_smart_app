from pydantic_ai import Agent
from dotenv import load_dotenv
from paths import MODEL
from pydantic import BaseModel

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
    ),
    output_type=FoodResult,
)

async def analyze_images(images_bytes: bytes, media_type:str = "image/jpg") -> FoodResult:
    result = await food_agent.run(
            [
            BinaryContent(data=image_bytes, media_type=media_type),
            "Analyze this food image and return the nutritional information.",
        ]
    )
    return result.output