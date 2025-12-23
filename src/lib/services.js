import axios from "axios";
import Cookies from "js-cookie";
import { API_CONFIG, PAGINATION_CONFIG } from "../config/constants";

/* ================================
   Axios Instance
================================ */
const API = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

/* ================================
   Request Interceptor
================================ */
API.interceptors.request.use(
  (config) => {
    const token = Cookies.get("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================================
   Response Interceptor
================================ */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      Cookies.remove("authToken");
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

/* ================================
   Centralized API Helpers
================================ */
const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    throw new Error(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
  throw new Error(error?.message || "Unexpected error");
};

const handleApiResponse = (response) => {
  if (!response?.data?.success) {
    throw new Error(response?.data?.message || "Request failed, try again");
  }
  return response.data;
};

const   apiHandler = async (apiCall) => {
  try {
    const response = await apiCall();
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/* ================================
   AUTH APIs
================================ */
const login = async (credentials) => {
  const response = await apiHandler(() =>
    API.post("/api/admin/login", credentials, {
      headers: {
        deviceuniqueid: credentials.deviceuniqueid,
        devicemodel: credentials.devicemodel,
      },
    })
  );

  const token = response?.data?.accessToken;

  if (token) {
    Cookies.set("authToken", token, {
      expires: 7,
      
    });
    window.location.href = "/";
  }

  return response;
};

const forgotPassword = (payload) =>
  apiHandler(() => API.post("/api/auth/send-otp/forgot-password", payload));


const verifyOTP = (payload) =>
  apiHandler(() =>
    API.post("/api/auth/verify-otp", payload, {
      headers: {
        deviceuniqueid: payload.deviceuniqueid,
        devicemodel: payload.devicemodel,
      },
    })
  );

const updatePasswordAuth = (payload) =>
  apiHandler(() => API.post("/api/auth/reset-password", payload));

/* ✅ CLIENT-SIDE LOGOUT (NO API CALL) */
const logout = () => {
  Cookies.remove("authToken");
  window.location.href = "/auth/login";
};

/* ================================
   DASHBOARD
================================ */
const getDashboardAnalytics = () =>
  apiHandler(() => API.get("/api/admin/dashboard"));

/* ================================
   PRODUCTS
================================ */
const createProduct = (data) =>
  apiHandler(() =>
    API.post("/product", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

const getAllProducts = (
  search,
  status,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize
) =>
  apiHandler(() =>
    API.get(
      `/product?page=${page}&limit=${limit}&search=${search}&status=${status}`
    )
  );

const getProductById = (id) => apiHandler(() => API.get(`/product/${id}`));

const updateProduct = (id, data) =>
  apiHandler(() => API.put(`/product/${id}`, data));

const deleteProduct = (id) => apiHandler(() => API.delete(`/product/${id}`));

/* ================================
   CATEGORIES
================================ */
const createCategory = (data) => apiHandler(() => API.post("/category", data));

const getAllCategories = (
  status,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize
) =>
  apiHandler(() =>
    API.get(`/category?status=${status}&page=${page}&limit=${limit}`)
  );

const getCategoryById = (id) => apiHandler(() => API.get(`/category/${id}`));

const updateCategory = (id, data) =>
  apiHandler(() => API.put(`/category/${id}`, data));

const deleteCategory = (id) => apiHandler(() => API.delete(`/category/${id}`));

/* ================================
   ORDERS
================================ */
const getOrders = (
  paymentStatus,
  orderStatus,
  orderType,
  startDate,
  endDate,
  search,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize
) =>
  apiHandler(() =>
    API.get(
      `/order?paymentStatus=${paymentStatus}&orderStatus=${orderStatus}&orderType=${orderType}&startDate=${startDate}&endDate=${endDate}&search=${search}&page=${page}&limit=${limit}`
    )
  );

const getOrdersByContact = (email) =>
  apiHandler(() => API.get(`/order/contact?email=${email}`));

const getOrderById = (id) => apiHandler(() => API.get(`/order/${id}`));

const updateOrder = (id, data) =>
  apiHandler(() => API.put(`/order/${id}`, data));

/* ================================
   EXPORT
================================ */
export const api = {
  login,
  logout,
  forgotPassword,
  verifyOTP,
  getDashboardAnalytics,
updatePasswordAuth,

  // products
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,

  // categories
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,

  // orders
  getOrders,
  getOrdersByContact,
  getOrderById,
  updateOrder,
};
