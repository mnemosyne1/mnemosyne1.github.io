import asyncio
import json
import random
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()
latest_images = []

# Dodajemy middleware CORS
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],  # Możesz tutaj dodać specyficzne domeny zamiast "*"
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


# WebSocket manager to handle connections
class ConnectionManager:
	def __init__(self):
		self.active_connections: list[WebSocket] = []

	async def connect(self, websocket: WebSocket):
		await websocket.accept()
		self.active_connections.append(websocket)
		for img in latest_images:
			await websocket.send_text(img)

	def disconnect(self, websocket: WebSocket):
		self.active_connections.remove(websocket)

	async def broadcast(self, message: str):
		for connection in self.active_connections:
			await connection.send_text(message)


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
	await manager.connect(websocket)
	try:
		while True:
			await asyncio.sleep(1)  # Keep the connection open
	except WebSocketDisconnect:
		manager.disconnect(websocket)


def generate_random_rectangle():
	return {
		"x": random.randint(0, 200),
		"y": random.randint(0, 200),
		"width": random.randint(20, 200),
		"height": random.randint(20, 200),
		"fill": "#" + ''.join([random.choice('0123456789ABCDEF') for _ in range(6)])
	}


@app.post("/add_image")
async def add_image():
	if False:
		if random.random() < 0.1:
			raise HTTPException(status_code=418, detail="I'm a teapot'")

		# Losowa decyzja, czy zwrócić duży obrazek
		rectangles = [generate_random_rectangle() for _ in range(100000 if random.random() < 0.1 else 10)]

		# Losowa decyzja, czy opóźnić odpowiedź
		if random.random() < 0.1:
			await asyncio.sleep(10)

	rectangles = [generate_random_rectangle() for _ in range(10)] # TMP
	image = {'rectangles': rectangles}
	latest_images.append(json.dumps(image))
	await manager.broadcast(json.dumps(image))
	return JSONResponse(content={"message": "Image added successfully"}, status_code=200)
