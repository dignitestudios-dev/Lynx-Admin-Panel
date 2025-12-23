import React, { useEffect } from "react";
import {
  Users,
  Activity,
  MessageSquare,
  CreditCard,
  UserCheck,
  UserX,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import { CHART_COLORS } from "../config/constants";
import { useApp } from "../contexts/AppContext";
import Card from "../components/ui/Card";
import StatsCard from "../components/common/StatsCard";
import useGetDashboardAnalytics from "../hooks/dashboard-analytics/useGetDashboardAnalytics";

const Dashboard = () => {
  const { loading } = useGetDashboardAnalytics();
  const { dashboardAnalytics } = useApp();

  useEffect(() => {
    if (dashboardAnalytics && Object.keys(dashboardAnalytics).length > 0) {
      console.log("Dashboard Analytics Data:", dashboardAnalytics);
    }
  }, [dashboardAnalytics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const stats = {
    totalUsers: dashboardAnalytics?.totalUsers || 0,
    activeUsers: dashboardAnalytics?.activeUserCount || 0,
    blockedUsers: dashboardAnalytics?.blockedUserCount || 0,
    bannedUsers: dashboardAnalytics?.restrictedUserCount || 0,
    totalTransactions: dashboardAnalytics?.totalRevenue || 0,
  };

  const revenueData =
    dashboardAnalytics?.revenueGraph?.map((item) => ({
      month: item.month,
      revenue: item.total,
    })) || [];

  const userSignupData =
    dashboardAnalytics?.userSignupGraph?.map((item) => ({
      month: item.month,
      count: item.count,
    })) || [];

  const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const mainStats = [
    { title: "Total Users", value: formatNumber(stats.totalUsers), icon: Users },
    { title: "Active Users", value: formatNumber(stats.activeUsers), icon: Activity },
    { title: "Banned Users", value: formatNumber(stats.bannedUsers), icon: UserX },
    { title: "Transactions", value: formatCurrency(stats.totalTransactions), icon: CreditCard },
    { title: "Blocked Users", value: formatNumber(stats.blockedUsers), icon: UserCheck },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Platform overview & analytics</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={<stat.icon />}
            index={index}
          />
        ))}
      </div>
<div className="grid grid-cols-2 gap-4
 ">

      {/* Revenue Chart */}
      <Card>
        <Card.Header className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Revenue</h3>
        </Card.Header>
        <Card.Content className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.primary} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card.Content>
      </Card>

      {/* User Signup Chart */}
     <Card>
  <Card.Header className="mb-4">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
      Monthly User Signups
    </h3>
  </Card.Header>
  <Card.Content className="h-80">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={userSignupData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        {/* Smooth grid */}
        <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" vertical={false} />

        {/* X-axis */}
        <XAxis
          dataKey="month"
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={{ stroke: "#d1d5db" }}
        />

        {/* Y-axis */}
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={{ stroke: "#d1d5db" }}
          tickFormatter={(value) => formatNumber(value)}
        />

        {/* Tooltip */}
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", borderRadius: 8, border: "none", color: "#fff", padding: "8px 12px" }}
          labelStyle={{ color: "#9ca3af" }}
          formatter={(value) => formatNumber(value)}
        />

        {/* Gradient fill */}
        <defs>
          <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.secondary} stopOpacity={0.4} />
            <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Line */}
        <Line
          type="monotone"
          dataKey="count"
          stroke={CHART_COLORS.secondary}
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: CHART_COLORS.secondary }}
          activeDot={{ r: 6 }}
          fill="url(#signupGradient)"
        />
      </LineChart>
    </ResponsiveContainer>
  </Card.Content>
</Card>
 </div>
    </div>
  );
};

export default Dashboard;
