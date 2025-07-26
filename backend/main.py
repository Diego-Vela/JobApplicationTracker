from fastapi import FastAPI
from backend.routers import users, resumes, applications

app = FastAPI()

app.include_router(users.router)
#app.include_router(resumes.router)
app.include_router(applications.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Job Application Tracker!"}

