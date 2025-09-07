# app/main.py
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, files, applications, notes
from .db import Base, engine
from mangum import Mangum
from .deps import get_current_user_id

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Application Tracker API")

handler = Mangum(app)

def set_user_state(request: Request, user = Depends(get_current_user_id)):
    request.state.user_id = user.user_id

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify a list of allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

# Protected routers
app.include_router(
    applications.router,
    dependencies=[Depends(set_user_state)]
)
app.include_router(
    notes.router,
    dependencies=[Depends(set_user_state)]
)
app.include_router(
    files.router,
    dependencies=[Depends(set_user_state)]
)
