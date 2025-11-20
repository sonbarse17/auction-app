from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.db.connection import init_db, close_db
from app.api.v1.router import api_router
from app.websocket.auction_ws import router as ws_router
from app.services.timer_service import timer_service
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.core.logging import setup_logging
from contextlib import asynccontextmanager
import logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up application...")
    await init_db()
    await timer_service.connect()
    timer_service.start_background_task()
    yield
    # Shutdown
    logger.info("Shutting down application...")
    await timer_service.stop_background_task()
    await close_db()

app = FastAPI(title="Sports Auction Platform", lifespan=lifespan)

import os

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost").split(",")

# Security middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

# Compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(api_router)
app.include_router(ws_router)

@app.get("/")
async def root():
    return {"message": "Sports Auction Platform API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
