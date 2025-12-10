from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from ..models import UserCreate, UserLogin, AuthResponse, Error, User
from ..db import db
from ..dependencies import create_access_token, get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
    responses={404: {"description": "Not found"}},
)

@router.post("/signup", response_model=AuthResponse, status_code=201, responses={400: {"model": Error}})
async def signup(user: UserCreate):
    db_user = db.create_user(user)
    if not db_user:
        return JSONResponse(
            status_code=400,
            content={"error": "Email or username already registered"}
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"user": db_user, "token": access_token}

@router.post("/login", response_model=AuthResponse, responses={401: {"model": Error}})
async def login(user_in: UserLogin):
    user_dict = db.get_user_by_email(user_in.email)
    if not user_dict or not db.verify_password(user_in.password, user_dict["hashed_password"]):
         return JSONResponse(
            status_code=401,
            content={"error": "Invalid email or password"}
        )
    
    # Return user object without password
    user_obj = User(**{k: v for k, v in user_dict.items() if k != "hashed_password"})
    access_token = create_access_token(data={"sub": user_in.email})
    return {"user": user_obj, "token": access_token}

@router.post("/logout")
async def logout():
    return {"success": True}

@router.get("/me", response_model=dict)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {"user": current_user}
