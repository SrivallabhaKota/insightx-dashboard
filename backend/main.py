from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io

import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="InsightX AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/sales", response_model=List[schemas.Sales])
def read_sales(db: Session = Depends(database.get_db)):
    return db.query(models.SalesData).all()

@app.post("/api/sales", response_model=schemas.Sales)
def create_sales(sales: schemas.SalesCreate, db: Session = Depends(database.get_db)):
    db_sales = models.SalesData(**sales.model_dump())
    db.add(db_sales)
    db.commit()
    db.refresh(db_sales)
    return db_sales

@app.post("/api/upload")
async def upload_data(file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xls', '.xlsx')):
            # Explicitly use openpyxl for xlsx
            df = pd.read_excel(io.BytesIO(contents), engine='openpyxl' if file.filename.endswith('.xlsx') else None)
        else:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Clean up column names (strip spaces, lowercase for comparison)
        df.columns = [str(c).strip().lower() for c in df.columns]
        
        # Replace NaN with appropriate defaults
        df = df.fillna(0)
        
        for _, row in df.iterrows():
            # Get values using lowercase keys, providing fallback keys
            db_sales = models.SalesData(
                product=str(row.get('product', 'Unknown')),
                category=str(row.get('category', 'Misc')),
                revenue=float(row.get('revenue', 0)),
                profit=float(row.get('profit', 0)),
                quantity=int(row.get('quantity', 0)),
                region=str(row.get('region', 'Global')),
                date=str(row.get('date', '2024-01-01'))
            )
            db.add(db_sales)
        db.commit()
        return {"message": "Data uploaded successfully", "rows": len(df)}
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/dashboard-summary", response_model=schemas.DashboardSummary)
def get_summary(db: Session = Depends(database.get_db)):
    sales = db.query(models.SalesData).all()
    if not sales:
        return {
            "total_revenue": 0, "total_sales": 0, "total_orders": 0,
            "total_profit": 0, "top_product": "N/A", "monthly_growth": 0
        }
    
    total_revenue = sum(s.revenue for s in sales)
    total_profit = sum(s.profit for s in sales)
    total_orders = len(sales)
    total_sales = sum(s.quantity for s in sales)
    
    products = {}
    for s in sales:
        products[s.product] = products.get(s.product, 0) + s.revenue
    top_product = max(products, key=products.get) if products else "N/A"
    
    return {
        "total_revenue": round(total_revenue, 2),
        "total_sales": total_sales,
        "total_orders": total_orders,
        "total_profit": round(total_profit, 2),
        "top_product": top_product,
        "monthly_growth": 12.5 # Mock growth for now
    }

@app.get("/api/charts-data")
def get_charts(db: Session = Depends(database.get_db)):
    sales = db.query(models.SalesData).all()
    # Simplified aggregation for demo
    df = pd.DataFrame([{"revenue": s.revenue, "date": s.date, "category": s.category} for s in sales])
    if df.empty:
        return {"labels": [], "datasets": []}
    
    # Revenue Trend (by date)
    trend = df.groupby('date')['revenue'].sum().reset_index()
    
    # Category Revenue
    cat_revenue = df.groupby('category')['revenue'].sum().reset_index()
    
    return {
        "trend": {
            "labels": trend['date'].tolist(),
            "data": trend['revenue'].tolist()
        },
        "category": {
            "labels": cat_revenue['category'].tolist(),
            "data": cat_revenue['revenue'].tolist()
        }
    }

@app.get("/api/ai-insights")
def get_insights(db: Session = Depends(database.get_db)):
    # Simulated AI logic based on data
    sales = db.query(models.SalesData).all()
    if not sales:
        return ["No data available for insights."]
    
    df = pd.DataFrame([s.__dict__ for s in sales])
    top_cat = df.groupby('category')['revenue'].sum().idxmax()
    avg_profit_margin = (df['profit'].sum() / df['revenue'].sum()) * 100 if df['revenue'].sum() > 0 else 0
    
    insights = [
        f"Revenue is dominated by the {top_cat} category.",
        f"Overall profit margin is currently {avg_profit_margin:.1f}%.",
        "Recommendation: Increase marketing spend in low-performing regions.",
        "Insight: Sales peak observed during mid-month intervals."
    ]
    return insights

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
