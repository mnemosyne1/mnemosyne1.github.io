import asyncio
import random
from fastapi import FastAPI, HTTPException, responses
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


# Dodajemy middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Możesz tutaj dodać specyficzne domeny zamiast "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_random_rectangle():
	return {
		"x": random.randint(0, 200),
		"y": random.randint(0, 200),
		"width": random.randint(20, 200),
		"height": random.randint(20, 200),
		"fill": "#" + ''.join([random.choice('0123456789ABCDEF') for _ in range(6)])
	}


@app.get('/image')
async def get_img():
	if random.random() < 0.1:
		raise HTTPException(status_code=418, detail="I'm a teapot'")

	# Losowa decyzja, czy zwrócić duży obrazek
	rectangles = [generate_random_rectangle() for _ in range
					(100000 if random.random() < 0.1 else 10)]

	# Losowa decyzja, czy opóźnić odpowiedź
	if random.random() < 0.1:
		await asyncio.sleep(10)

	return responses.JSONResponse(content={"rectangles": rectangles})
