import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [step, setStep] = useState("form"); // "form" or "otp"
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (isSignUp) {
      try {
        const res = await API.post("/api/v1/auth/send-otp", formData);
        setMessage(res.data.message);
        setStep("otp");
      } catch (err) {
        setMessage(err.response?.data?.error || "Error sending OTP");
      }
    } else {
      try {
        const res = await API.post("/api/v1/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        setMessage(res.data.message);

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.user?.role === "admin") {
          localStorage.setItem("adminToken", res.data.token);
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } catch (err) {
        setMessage(err.response?.data?.error || "Login failed");
      }
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await API.post("/api/v1/auth/verify-otp", { email: formData.email, otp });
      setMessage(res.data.message);
      setStep("form");
      setIsSignUp(false);
      setFormData({ name: "", email: "", password: "" });
      setOtp("");
    } catch (err) {
      setMessage(err.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isForgotPassword
            ? step === "otp"
              ? "Enter OTP & New Password"
              : "Reset Password"
            : isSignUp
            ? step === "form"
              ? "Create Account"
              : "Verify OTP"
            : "Welcome Back"}
        </h2>

        {/* Forgot Password Flow */}
        {isForgotPassword && step === "form" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Enter your email to receive a password reset OTP.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              onClick={async () => {
                setMessage("");
                try {
                  const res = await API.post("/api/v1/auth/request-password-reset", { email: resetEmail });
                  setMessage(res.data.message);
                  setStep("otp");
                } catch (err) {
                  setMessage(err.response?.data?.error || "Failed to send OTP");
                }
              }}
              className="w-full bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition"
            >
              Send Reset OTP
            </button>
          </div>
        )}

        {isForgotPassword && step === "otp" && (
          <div className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={async () => {
                setMessage("");
                try {
                  const res = await API.post("/api/v1/auth/reset-password", {
                    email: resetEmail,
                    otp,
                    newPassword,
                  });
                  setMessage(res.data.message);
                  setIsForgotPassword(false);
                  setStep("form");
                  setResetEmail("");
                  setOtp("");
                  setNewPassword("");
                } catch (err) {
                  setMessage(err.response?.data?.error || "Password reset failed");
                }
              }}
              className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
            >
              Reset Password
            </button>
          </div>
        )}

        {/* Original Login / Signup Flow */}
        {!isForgotPassword && step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="yahye abdullahi abdi"
                  className="w-full p-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="farah@gmail.com"
                className="w-full p-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                className="w-full p-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </button>
          </form>
        )}

        {!isForgotPassword && step === "otp" && (
          <div className="space-y-4">
            <p>Enter the OTP sent to your email:</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleVerifyOTP}
              className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
            >
              Verify OTP
            </button>
          </div>
        )}

        {message && <p className="mt-4 text-center text-red-600">{message}</p>}

        {/* Toggle Links */}
        <div className="text-center text-sm mt-4 space-y-2">
          {!isForgotPassword && step === "form" && (
            <>
              {isSignUp ? (
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsSignUp(false)}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <>
                  <p>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setIsSignUp(true)}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                  <p>
                    <button
                      onClick={() => setIsForgotPassword(true)}
                      className="text-orange-600 font-medium hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </p>
                </>
              )}
            </>
          )}

          {isForgotPassword && (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setStep("form");
                setResetEmail("");
                setOtp("");
                setNewPassword("");
              }}
              className="text-blue-600 font-medium hover:underline"
            >
              ← Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;