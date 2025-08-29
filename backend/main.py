# app/main.py
from fastapi import FastAPI
from .routers import auth, users, files, applications, notes
from .db import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Application Tracker API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(files.router)
app.include_router(applications.router)
app.include_router(notes.router)
