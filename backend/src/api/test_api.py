from fastapi import APIRouter


TEST_ROUTER = APIRouter()


@TEST_ROUTER.get("/")
async def root():
    return {"message": "Hello World"}
