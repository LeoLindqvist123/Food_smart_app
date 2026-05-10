from pydantic_ai import Agent
from dotenv import load_dotenv

load_dotenv()
MODEL = "openrouter:nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"

food_agent = Agent(
    model = MODEL,
    system_prompt=(
        "You are a intelligent and smart scanner"
    ),
)