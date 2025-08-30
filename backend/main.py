# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, files, applications, notes
from .db import Base, engine
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Application Tracker API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify a list of allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(files.router)
app.include_router(applications.router)
app.include_router(notes.router)
