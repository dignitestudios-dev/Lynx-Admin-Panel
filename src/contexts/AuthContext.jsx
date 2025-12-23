import React, { createContext, useContext, useState, useEffect } from "react";
import { SECURITY_CONFIG } from "../config/constants";
import { handleError, handleSuccess } from "../utils/helpers";
import { api } from "../lib/services";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAuthActions, setLoadingAuthActions] = useState(false);

  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [remainingLockTime, setRemainingLockTime] = useState(null);

  /* =========================
     Lockout Helpers
  ========================== */

  const isLockedOut = () => {
    if (!lockedUntil) return false;
    return new Date() < new Date(lockedUntil);
  };

  /* =========================
     Login
  ========================== */

  const login = async (email, password) => {
    if (isLockedOut()) {
      const remainingMinutes = Math.ceil(
        (new Date(lockedUntil) - new Date()) / 60000
      );
      return {
        success: false,
        error: `Account locked. Try again in ${remainingMinutes} minutes.`,
      };
    }

    setLoading(true);

    try {
      const deviceuniqueid = `device-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;
      const devicemodel = navigator.userAgent || "Unknown Device";

      const response = await api.login({
        email,
        password,
      });

      // const response = {
      //   data: {
      //     user: { name: "Admin", role: "admin" },
      //     token: "123123123",
      //   },
      // };
      console.log(response, "ddddd");
      setUser(response.data.user);
      setLoginAttempts(0);
      setLockedUntil(null);

      handleSuccess("Login successful");
      return { success: true, user: response.data.user };
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
        const lockoutEnd = new Date(
          Date.now() + SECURITY_CONFIG.lockoutDuration
        );
        setLockedUntil(lockoutEnd.toISOString());

        return {
          success: false,
          error: `Too many failed attempts. Account locked for ${
            SECURITY_CONFIG.lockoutDuration / 60000
          } minutes.`,
        };
      }

      handleError(error);
      return {
        success: false,
        error: `Invalid credentials. ${
          SECURITY_CONFIG.maxLoginAttempts - newAttempts
        } attempts remaining.`,
      };
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Logout
  ========================== */

  const logout = async () => {
    setLoading(true);
    try { const response = await api.logout();
      setUser(null);
      setLoginAttempts(0);
      setLockedUntil(null);

      handleSuccess("Logout successful");
      return { success: true };
    } catch (error) {
      handleError(error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Forgot Password
  ========================== */

  const forgotPassword = async (payload) => {
    setLoadingAuthActions(true);
    try {
      const response = await api.forgotPassword(payload);
      return response.success;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoadingAuthActions(false);
    }
  };

  /* =========================
     Verify OTP
  ========================== */

  const verifyOTP = async (payload) => {
    setLoadingAuthActions(true);
    try {
      const deviceuniqueid = `device-${Date.now()}-${Math.floor(
        Math.random() * 2000
      )}`;
      const devicemodel = navigator.userAgent || "Unknown Device";

      const response = await api.verifyOTP({
        ...payload,
      });

      const token = response?.token;

      if (token) {
        Cookies.set("access_token", token, {
          expires: 0.02, // ⏳ ~30 minutes (OTP token short-lived hota hai)
          sameSite: "strict",
        });
      }

      // setUser(response.data.user);
      handleSuccess("OTP verified successfully");
      return { success: true };
    } catch (error) {
      handleError(error);
      return { success: false };
    } finally {
      setLoadingAuthActions(false);
    }
  };

  /* =========================
     Update Password
  ========================== */

  const updatePassword = async (payload) => {
    setLoadingAuthActions(true);
    try {
      const response = await api.updatePassword(payload);
      handleSuccess("Password updated successfully");
      return response;
    } catch (error) {
      handleError(error);
      return { success: false };
    } finally {
      setLoadingAuthActions(false);
    }
  };

  const updatePasswordAuth = async (payload) => {
    setLoadingAuthActions(true);

    try {
      // 🔑 token cookies se uthao
      const token = Cookies.get("access_token");

      const response = await api.updatePasswordAuth({
        ...payload,
        token, // ✅ body me token bhej diya
      });

      handleSuccess("Password updated successfully");

      // 🧹 cleanup
      Cookies.remove("access_token");

      setUser(null);
      setLoginAttempts(0);
      setLockedUntil(null);

      return response;
    } catch (error) {
      handleError(error);
      return { success: false };
    } finally {
      setLoadingAuthActions(false);
    }
  };

  /* =========================
     Register
  ========================== */

  const register = async (email, password, name) => {
    setLoading(true);
    try {
      const response = await api.register({ email, password, name });
      handleSuccess("User registered successfully");
      return response;
    } catch (error) {
      handleError(error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Lock Timer
  ========================== */

  useEffect(() => {
    if (!lockedUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.max(new Date(lockedUntil) - new Date(), 0);
      setRemainingLockTime(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setLockedUntil(null);
        setLoginAttempts(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  /* =========================
     Context Value
  ========================== */

  const value = {
    user,
    loading,
    loadingAuthActions,
    isAuthenticated: !!user,
    isLockedOut: isLockedOut(),
    loginAttempts,
    remainingLockTime,
    login,
    logout,
    forgotPassword,
    verifyOTP,
    updatePassword,
    updatePasswordAuth,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
