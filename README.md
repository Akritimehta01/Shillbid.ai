# Shillbid.ai

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-ko7gn12b)
# ShillBid AI

An ML-powered auction fraud detection platform that identifies suspicious bidding behavior, collusive bidder networks, and shill bidding patterns using anomaly detection, graph analytics, and real-time risk scoring.

---

## 🚀 Features

* 🔍 Fraud & shill bidding detection
* 📊 Real-time auction risk scoring
* 🧠 Machine learning-based anomaly detection
* 🕸️ Bidder-seller network graph visualization
* 📈 Interactive analytics dashboard
* ⚡ Live fraud alerts using WebSockets
* 🧾 Explainable AI insights with SHAP
* 🗂️ Synthetic auction data generation

---

## 🧠 Tech Stack

### Frontend

* React / Next.js
* Tailwind CSS
* Plotly / Recharts / D3.js

### Backend

* FastAPI
* Python

### Machine Learning

* Scikit-learn
* XGBoost
* Isolation Forest
* Pandas & NumPy
* SHAP

### Database

* PostgreSQL

### Graph Analytics

* NetworkX
* Neo4j (optional)

---

## 📌 Problem Statement

Online auction platforms are vulnerable to fraudulent bidding practices such as:

* Shill bidding
* Bid inflation
* Seller-bidder collusion
* Circular fraud rings
* Last-minute fake bid pressure

ShillBid AI aims to detect and analyze these behaviors using machine learning, anomaly detection, and graph-based fraud analysis.

---

## 📊 Core Modules

### 1. Fraud Detection Engine

Detects suspicious bidding behavior using:

* XGBoost
* Random Forest
* Logistic Regression
* Isolation Forest

### 2. Graph Fraud Analytics

Builds bidder-seller interaction networks to detect:

* Fraud rings
* Dense collusive clusters
* Repeated bidder patterns

### 3. Explainable AI

Provides interpretable fraud predictions using SHAP values.

### 4. Real-Time Alert System

Streams live bid events and triggers fraud alerts dynamically.

---

## 🖥️ Dashboard Features

* Fraud risk monitoring
* Auction analytics
* Suspicious bidder tracking
* Network visualization
* Live fraud alerts
* Explainability panel

---

Frontend setup:

```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```bash
shillbid-ai/
│
├── backend/
│   ├── app/
│   ├── models/
│   ├── routes/
│   ├── ml/
│   └── data/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   └── dashboard/
│
├── datasets/
├── notebooks/
├── requirements.txt
└── README.md
```

---

## 📈 Future Improvements

* Graph Neural Networks (GNNs)
* Real auction API integrations
* Advanced fraud ring detection
* Cloud deployment
* Multi-model ensemble learning
* User authentication & role management

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📜 License

MIT License

---

## 👩‍💻 Author

Akriti Mehta
