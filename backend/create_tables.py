# create_tables.py - create SQLAlchemy tables (useful when not running alembic)
from app.db.session import engine
from app.db.base import Base

print('Creating database tables...')
Base.metadata.create_all(bind=engine)
print('Tables created (if they did not exist).')
