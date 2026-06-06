import React, { useState, useEffect } from 'react';
import { Download, BarChart2, PieChart, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, exportToCSV } from '../utils';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/logs/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const analyticsData = await res.json();
      if (res.ok) {
        setData(analyticsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!data || data.vendorPerformance.length === 0) return;

    // Convert performance stats to CSV rows
    const reportData = data.vendorPerformance.map(v => ({
      'Vendor Name': v.name,
      'Category': v.category,
      'Star Rating': v.rating,
      'Orders Completed': v.orders,
      'Total Value (INR)': v.business
    }));

    exportToCSV(reportData, 'Vendor_Performance_Report_2026.csv');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading analytics report...</p>
      </div>
    );
  }

  if (!data) {
    return <p style={{ color: 'var(--text-secondary)' }}>Error compiling procurement graphs.</p>;
  }

  const { summary, categorySpend, monthlySpend, vendorPerformance } = data;
  const maxMonthlySpend = monthlySpend.length > 0 ? Math.max(...monthlySpend.map(m => m.value)) : 1;
  const maxCategorySpend = categorySpend.length > 0 ? Math.max(...categorySpend.map(c => c.value)) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reports &amp; Procurement Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Access monthly spending aggregates, cost savings, and vendor performance audits</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportCSV}>
          <Download size={16} /> Export CSV Report
        </button>
      </div>

      {/* Analytics Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Total Spend */}
        <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            padding: '1rem',
            borderRadius: '12px',
            color: 'var(--primary)'
          }}><TrendingUp size={24} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cumulative Spend</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>{formatCurrency(summary.totalSpend)}</h3>
          </div>
        </div>

        {/* Cost Savings */}
        <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '1rem',
            borderRadius: '12px',
            color: 'var(--secondary)'
          }}><Award size={24} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Audited Cost Savings</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px', color: 'var(--secondary)' }}>{formatCurrency(summary.costSavings)}</h3>
          </div>
        </div>

        {/* Vendors Count */}
        <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            padding: '1rem',
            borderRadius: '12px',
            color: 'var(--accent-blue)'
          }}><BarChart2 size={24} /></div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Suppliers</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>{summary.activeVendors} Vendors</h3>
          </div>
        </div>
      </div>

      {/* SVG Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '2rem'
      }}>
        
        {/* Monthly spend vertical bar chart */}
        <div className="card">
          <h3 className="card-title"><BarChart2 size={18} color="var(--primary)" /> Monthly Procurement Spending Trend</h3>
          
          <div style={{ marginTop: '2rem', height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', position: 'relative' }}>
            {monthlySpend.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data points recorded yet.</span>
            ) : (
              monthlySpend.map((m, idx) => {
                const percentHeight = maxMonthlySpend > 0 ? (m.value / maxMonthlySpend) * 100 : 0;
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    width: '60px',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}>
                    {/* Tooltip bar */}
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {formatCurrency(m.value).split('.')[0]}
                    </div>
                    {/* Glowing Bar */}
                    <div style={{
                      height: `${percentHeight * 0.7}%`,
                      width: '32px',
                      background: 'linear-gradient(to top, var(--primary), var(--accent-blue))',
                      borderRadius: '8px 8px 0 0',
                      boxShadow: '0 4px 12px var(--primary-glow)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                    onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                    ></div>
                    {/* Label */}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{m.month}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category horizontal bar chart */}
        <div className="card">
          <h3 className="card-title"><PieChart size={18} color="var(--primary)" /> Allocation by Category</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
            {categorySpend.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No spending recorded yet.</p>
            ) : (
              categorySpend.map((c, idx) => {
                const percentWidth = maxCategorySpend > 0 ? (c.value / maxCategorySpend) * 100 : 0;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ color: 'white' }}>{c.category}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(c.value)}</span>
                    </div>
                    {/* Horizontal Bar */}
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${percentWidth}%`,
                        background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Vendor Performance Scorecard */}
      <div className="card">
        <h3 className="card-title"><Award size={18} color="var(--primary)" /> Supplier Performance Scorecard</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
          Vendor rankings calculated based on star ratings, cost efficiencies, and invoice transaction counts
        </p>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Category</th>
                <th>Star Rating</th>
                <th>Purchase Orders Completed</th>
                <th style={{ textAlign: 'right' }}>Total Business Value</th>
              </tr>
            </thead>
            <tbody>
              {vendorPerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    No vendor performance metrics available.
                  </td>
                </tr>
              ) : (
                vendorPerformance.map((vendor, idx) => (
                  <tr key={vendor.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800 }}>#{idx + 1}</span>
                        <strong style={{ color: 'white' }}>{vendor.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{vendor.category}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
                        <span style={{ color: '#fbbf24' }}>★</span> {vendor.rating.toFixed(1)}
                      </div>
                    </td>
                    <td>
                      <span>{vendor.orders} order(s)</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'white' }}>
                      {formatCurrency(vendor.business)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
