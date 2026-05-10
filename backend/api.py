from fastapi import FastAPI, UploadFile, File

app = FastAPI(title="FoodSmart API")

@app.get("/")
def root():
    return{"STATUS": "Ok"}

@app.post("/scan")
async def scan_food(image: UploadFile = File(...)):
    scan = await image.read()
    return {
    "food": "äpple, banan, jordgubb"
    }
