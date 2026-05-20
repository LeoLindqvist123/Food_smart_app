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
    model=MODEL,
    system_prompt=(
        "You are a food scanning AI. Analyze the food in the image and return "
        "accurate nutritional estimates and a simple recipe if applicable."
    ),
    output_type=FoodResult,
    model_settings={"max_tokens": 1024},
)

async def analyze_images(images_bytes: bytes, media_type:str = "image/jpeg") -> FoodResult:
    result = await food_agent.run(
            [
            BinaryContent(data=image_bytes, media_type=media_type),
            "Analyze this food image and return the nutritional information.",
        ]
    )
    return result.output