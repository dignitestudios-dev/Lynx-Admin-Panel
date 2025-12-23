import { useEffect, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetDashboardAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const { dashboardAnalytics, setDashboardAnalytics } = useApp();

  const getDashboardAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardAnalytics();
      const data = res?.data|| {};
      setDashboardAnalytics(data);
      
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Fetch only if no data yet
    if (!dashboardAnalytics || Object.keys(dashboardAnalytics).length === 0) {
      getDashboardAnalytics();
    }
  }, []);
  
  console.log("Dashboard Analytics Data:", dashboardAnalytics);
  return { loading, getDashboardAnalytics };
};

export default useGetDashboardAnalytics;
