from pydantic import BaseModel
from typing import List, Optional

class SalesBase(BaseModel):
    product: str
    category: str
    revenue: float
    profit: float
    quantity: int
    region: str
    date: str

class SalesCreate(SalesBase):
    pass

class Sales(SalesBase):
    id: int

    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    total_revenue: float
    total_sales: int
    total_orders: int
    total_profit: float
    top_product: str
    monthly_growth: float

class ChartData(BaseModel):
    labels: List[str]
    datasets: List[dict]
