import React, { useEffect, useState } from "react";
import api from "../api";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.get("/logs/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!analytics) return;

    const rows = [
      ["Metric", "Value"],
      ["Active RFQs", analytics.summary.activeRfqs],
      ["Pending Approvals", analytics.summary.pendingApprovals],
      ["Active Vendors", analytics.summary.activeVendors],
      ["Total Spend", analytics.summary.totalSpend],
      ["Cost Savings", analytics.summary.costSavings],
    ];

    const csvContent = rows
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-report.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="card">
        Loading analytics...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontWeight: 800 }}>
            Reports & Procurement Analytics
          </h2>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
            }}
          >
            Spending, savings and vendor insights
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={exportCSV}
        >
          Export CSV Report
        </button>
      </div>

      {/* SUMMARY */}

      <div className="dashboard-grid">
        <div className="stat-card">
          <h4>Active RFQs</h4>
          <h1>
            {analytics?.summary?.activeRfqs ?? 0}
          </h1>
        </div>

        <div className="stat-card">
          <h4>Pending Approvals</h4>
          <h1>
            {analytics?.summary?.pendingApprovals ??
              0}
          </h1>
        </div>

        <div className="stat-card">
          <h4>Active Vendors</h4>
          <h1>
            {analytics?.summary?.activeVendors ?? 0}
          </h1>
        </div>

        <div className="stat-card">
          <h4>Total Spend</h4>
          <h1>
            ₹
            {Number(
              analytics?.summary?.totalSpend || 0
            ).toLocaleString()}
          </h1>
        </div>

        <div className="stat-card">
          <h4>Cost Savings</h4>
          <h1>
            ₹
            {Number(
              analytics?.summary?.costSavings || 0
            ).toLocaleString()}
          </h1>
        </div>
      </div>

      {/* CATEGORY SPEND */}

      <div className="card">
        <h3>Category Spend Allocation</h3>

        {analytics?.categorySpend?.length === 0 ? (
          <p>No category spend data available</p>
        ) : (
          <table
            style={{
              width: "100%",
              marginTop: "15px",
            }}
          >
            <thead>
              <tr>
                <th>Category</th>
                <th>Spend</th>
              </tr>
            </thead>

            <tbody>
              {analytics.categorySpend.map(
                (item, index) => (
                  <tr key={index}>
                    <td>{item.category}</td>
                    <td>
                      ₹
                      {Number(
                        item.amount
                      ).toLocaleString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MONTHLY SPEND */}

      <div className="card">
        <h3>Monthly Spending Trend</h3>

        {analytics?.monthlySpend?.length === 0 ? (
          <p>No spending data available</p>
        ) : (
          <table
            style={{
              width: "100%",
              marginTop: "15px",
            }}
          >
            <thead>
              <tr>
                <th>Month</th>
                <th>Spend</th>
              </tr>
            </thead>

            <tbody>
              {analytics.monthlySpend.map(
                (item, index) => (
                  <tr key={index}>
                    <td>{item.month}</td>
                    <td>
                      ₹
                      {Number(
                        item.amount
                      ).toLocaleString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* VENDOR PERFORMANCE */}

      <div className="card">
        <h3>Vendor Performance</h3>

        {analytics?.vendorPerformance?.length ===
        0 ? (
          <p>No vendor data available</p>
        ) : (
          <table
            style={{
              width: "100%",
              marginTop: "15px",
            }}
          >
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Rating</th>
                <th>Orders</th>
              </tr>
            </thead>

            <tbody>
              {analytics.vendorPerformance.map(
                (vendor, index) => (
                  <tr key={index}>
                    <td>{vendor.name}</td>
                    <td>{vendor.rating}</td>
                    <td>{vendor.orders}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}