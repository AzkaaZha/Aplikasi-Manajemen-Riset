from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

from app.core.config import APP_NAME
from app.api.routes.health import router as health_router
from app.api.routes.user import router as user_router
from app.api.routes.auth import router as auth_router
from app.models import Role, User

app = FastAPI(title=APP_NAME)

app.include_router(health_router)
app.include_router(user_router)
app.include_router(auth_router)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version="1.0.0",
        description="Auth Service API",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    }

    protected_paths = [
        "/auth/me",
        "/users/",
        "/users/{user_id}",
    ]

    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            if path in protected_paths:
                openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
