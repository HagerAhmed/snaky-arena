#!/usr/bin/env python3
"""Debug script to check if models are registered with Base"""
from app.database import Base
from app.db_models import UserModel, ScoreModel, ActivePlayerModel

print("Tables registered with Base.metadata:")
for table_name in Base.metadata.tables.keys():
    print(f"  - {table_name}")

print(f"\nTotal tables: {len(Base.metadata.tables)}")
