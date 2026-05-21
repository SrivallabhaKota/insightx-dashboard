from sqlalchemy import Column, Integer, String, Float, Date
from database import Base

class SalesData(Base):
    __tablename__ = "sales_data"

    id = Column(Integer, primary_key=True, index=True)
    product = Column(String)
    category = Column(String)
    revenue = Column(Float)
    profit = Column(Float)
    quantity = Column(Integer)
    region = Column(String)
    date = Column(String) # Storing as string for simplicity in this prototype, or use Date
