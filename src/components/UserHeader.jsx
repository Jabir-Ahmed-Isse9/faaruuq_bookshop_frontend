// src/components/UserHeader.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaBars, FaTimes, FaShoppingCart } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { MdOutlineExplore } from "react-icons/md";
import logo from "../assets/images/logo.jpg";
import { Link, useNavigate } from "react-router-dom";
import CartSidebar from "./CartSidebar";
import API from "../api";

const Header = ({ isDarkMode, toggleDarkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);
  const [animateBadge, setAnimateBadge] = useState(false); // ✅ For animation

  const getUser = localStorage.getItem("user");
  const navigate = useNavigate();

  const initials = getUser
    ? (() => {
        const name = JSON.parse(getUser)?.name || "";
        return name
          .split(" ")
          .filter(Boolean)
          .map((word) => word[0]?.toUpperCase() || "")
          .slice(0, 2)
          .join("");
      })()
    : "";

  // ✅ Fetch cart count
  const fetchCartCount = useCallback(async () => {
    try {
      setLoadingCart(true);
      const res = await API.get('/api/v1/cart');
      const count = res.data?.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;
      setCartCount(prev => {
        if (prev !== count) {
          setAnimateBadge(true); // Trigger animation only if count changes
          setTimeout(() => setAnimateBadge(false), 600); // Reset after animation
        }
        return count;
      });
    } catch (err) {
      console.error("Failed to fetch cart count:", err);
      setCartCount(0);
    } finally {
      setLoadingCart(false);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // Re-fetch when cart sidebar opens/closes to stay in sync
  useEffect(() => {
    if (!isCartOpen) return;
    const timer = setTimeout(() => fetchCartCount(), 300);
    return () => clearTimeout(timer);
  }, [isCartOpen, fetchCartCount]);

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-lg sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex flex-col items-center text-gray-800 dark:text-white font-bold text-sm transition-transform duration-200 hover:scale-105"
          >
            <img
              src={logo}
              alt="FAARUUQ Logo"
              className="h-10 object-contain opacity-95 hover:opacity-100 transition"
            />
            <span className="-mt-1 tracking-widest font-semibold">FAARUUQ</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <div
              className={`relative w-full max-w-md transition-all duration-300 ${
                isSearching ? "scale-105" : ""
              }`}
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <FiSearch />
              </span>
              <input
                type="text"
                placeholder="Search books & stationery..."
                className="w-full pl-12 pr-36 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 dark:text-gray-100"
                onFocus={() => setIsSearching(true)}
                onBlur={() => setIsSearching(false)}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-110 shadow">
                <div className="flex items-center gap-1">
                  <MdOutlineExplore />
                  <span>Explore</span>
                </div>
              </button>
            </div>
          </div>

          {/* Nav Links + Cart */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            <li>
              <Link
                to="/"
                className="hover:text-blue-700 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-blue-700 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className="hover:text-blue-700 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300"
              >
                Books
              </Link>
            </li>
            <li>
              <Link
                to="/stationery"
                className="hover:text-blue-700 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300"
              >
                Stationery
              </Link>
            </li>

            {getUser ? (
              <>
                <li>
                  <Link
                    to="/userorders"
                    className="hover:text-blue-700 dark:hover:text-blue-400 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    My Orders
                  </Link>
                </li>

                <li className="relative">
                  <button
                    onClick={() => setShowSignOut((prev) => !prev)}
                    className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold hover:scale-110 transition-transform"
                    title={JSON.parse(getUser)?.name}
                  >
                    {initials}
                  </button>
                  {showSignOut && (
                    <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-lg min-w-32">
                      <button
                        onClick={() => navigate("/userorders")}
                        className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/signin"
                  className="hover:text-blue-700 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300"
                >
                  Sign in
                </Link>
              </li>
            )}

            {/* ✅ Animated Cart Button */}
            <li>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex flex-col items-center text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 hover:scale-110 transition-transform pt-1"
              >
                <FaShoppingCart className="w-6 h-6" />
                {!loadingCart && cartCount > 0 && (
                  <span
                    className={`absolute -top-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 transition-all duration-300 ease-out ${
                      animateBadge ? 'scale-125 opacity-100' : 'scale-100 opacity-100'
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
                {loadingCart && (
                  <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-400 animate-pulse text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                    ...
                  </span>
                )}
              </button>
            </li>

            {/* Dark Mode Toggle */}
            <li>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8 0 1110.586 10.586z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-800 dark:text-white text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 px-5 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400">Home</Link>
              <Link to="/about" className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400">About</Link>
              <Link to="/products" className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400">Books</Link>
              <Link to="/stationery" className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400">Stationery</Link>

              {getUser ? (
                <>
                  <button
                    onClick={() => navigate("/userorders")}
                    className="py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Orders
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400"
                >
                  Sign in
                </Link>
              )}

              {/* ✅ Mobile Cart with Badge */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <FaShoppingCart className="text-gray-700 dark:text-gray-300" />
                <span className="text-gray-700 dark:text-gray-300">Cart</span>
                {!loadingCart && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
                    {cartCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        )}
      </header>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartData={null}
      />
    </>
  );
};

export default Header;