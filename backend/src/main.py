from os import getenv
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.test_api import TEST_ROUTER


def initialize_app() -> FastAPI:
    """Configures the Ironworks app.

    Returns:
        FastAPI: Configured app instance
    """
    app = FastAPI(title="Ironworks", description="Ironworks API", lifespan=lifespan)

    # Configure CORS
    origins = getenv("ALLOWED_ORIGINS", "").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routes
    app.include_router(TEST_ROUTER)

    return app


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator:
    """Configures app lifecycle events

    Args:
        app (FastAPI): FastAPI app to configure

    Returns:
        AsyncIterator: Generator for app lifecycle events
    """
    on_startup()
    yield
    on_shutdown()


def on_startup() -> None: ...


def on_shutdown() -> None: ...


app = initialize_app()
