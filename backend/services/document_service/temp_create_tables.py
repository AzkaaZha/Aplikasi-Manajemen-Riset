from app.db.session import Base, engine
import app.models

print("Creating tables...")

Base.metadata.create_all(bind=engine)

print("Done!")