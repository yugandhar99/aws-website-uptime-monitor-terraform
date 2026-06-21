import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiActivity,
  FiAlertCircle,
  FiClock,
  FiTrendingUp,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { uptimeAPI } from './api';

function App() {
  const [metrics, setMetrics] = useState(null);
  const [recentPings, setRecentPings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Load data on component mount and set up auto-refresh
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError('');
      const [metricsResponse, pingsResponse] = await Promise.all([
        uptimeAPI.getMetrics(),
        uptimeAPI.getRecentPings()
      ]);

      setMetrics(metricsResponse.data);
      setRecentPings(pingsResponse.data || []);
    } catch (err) {
      setError('Failed to load uptime data. Make sure your API is running.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    return status === 'SUCCESS' ? '#10b981' : '#ef4444';
  };

  const getStatusIcon = (status) => {
    return status === 'SUCCESS' ? <FiCheckCircle /> : <FiXCircle />;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div>Loading uptime data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1><FiActivity /> Uptime Monitor</h1>
        <p>Real-time website monitoring dashboard</p>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FiRefreshCw className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="error"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <FiAlertCircle />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="main-content">
        <div className="left-column">
          {metrics && (
            <motion.div
              className="metrics-grid"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="metric-card uptime">
                <div className="metric-icon">
                  <FiTrendingUp />
                </div>
                <div className="metric-content">
                  <div className="metric-number">{metrics.uptime}%</div>
                  <div className="metric-label">Uptime</div>
                </div>
              </div>

              <div className="metric-card errors">
                <div className="metric-icon">
                  <FiAlertCircle />
                </div>
                <div className="metric-content">
                  <div className="metric-number">{metrics.invalidStatusCount}</div>
                  <div className="metric-label">Invalid Status</div>
                </div>
              </div>

              <div className="metric-card response-time">
                <div className="metric-icon">
                  <FiClock />
                </div>
                <div className="metric-content">
                  <div className="metric-number">{metrics.avgResponseTime}ms</div>
                  <div className="metric-label">Avg Response Time</div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            className="recent-pings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2>Recent Ping Results (Last 30 minutes)</h2>
            <div className="ping-list">
              <AnimatePresence>
                {recentPings.length === 0 ? (
                  <motion.div
                    className="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FiActivity className="empty-state-icon" />
                    <h3>No recent pings</h3>
                    <p>Waiting for monitoring data...</p>
                  </motion.div>
                ) : (
                  recentPings.map((ping, index) => (
                    <motion.div
                      key={ping.id}
                      className={`ping-item ${ping.status.toLowerCase()}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      <div className="ping-item-main">
                        <div className="ping-status">
                          <span
                            className="status-icon"
                            style={{ color: getStatusColor(ping.status) }}
                          >
                            {getStatusIcon(ping.status)}
                          </span>
                          <span className="status-text">{ping.status}</span>
                        </div>

                        <div className="ping-details">
                          <span className="ping-time">{formatTime(ping.timestamp)}</span>
                          <span className="response-time">{ping.responseTime}ms</span>
                        </div>
                      </div>

                      {ping.errorMessage && (
                        <div className="error-message">
                          {ping.errorMessage}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <div className="right-column">
          {recentPings.length > 0 && (
            <motion.div
              className="chart-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2>Response Time (Last 30 minutes)</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={recentPings.slice().reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTime}
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip
                      labelFormatter={(value) => `Time: ${formatTime(value)}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                        color: '#1e293b'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, fill: '#8b5cf6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
