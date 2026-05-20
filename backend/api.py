from fastapi import FastAPI, UploadFile, File
from agent import food_agent
from pydantic_ai import BinaryContent

app = FastAPI(title="FoodSmart API")

@app.get("/")
def root():
    return{"STATUS": "Ok"}

@app.post("/scan")
async def scan_food(image: UploadFile = File(...)):
    contents = await image.read()
    result = await food_agent.run([
        BinaryContent(data=contents, media_type=image.content_type),
        "Analyze this food image and provide nutritional information"
    ])
    return result.data