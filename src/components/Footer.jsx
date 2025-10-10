import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import img from "../assets/images/logo.jpg"

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 flex items-start">
            <img src={img} alt="FAARUUQ Logo" className="h-6 mr-2 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800 dark:text-white">FAARUUQ  BookShop</span>
              <p className="text-xs mt-1">
                Yoolkeena waa bulsho maanka ka korta
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-800 dark:text-white mb-1">Quick Links</h3>
            <ul className="space-y-1 text-xs">
              <li><a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</a></li>
              <li><a href="/products" className="hover:text-blue-600 dark:hover:text-blue-400">Books</a></li>
              <li><a href="/stationery" className="hover:text-blue-600 dark:hover:text-blue-400">Stationery</a></li>
              <li><a href="/userorders" className="hover:text-blue-600 dark:hover:text-blue-400">My Orders</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-gray-800 dark:text-white mb-1">Contact</h3>
            <ul className="space-y-1 text-xs">
              <li>+252 61 427 0702</li>
              <li>info@faaruuqbooks.com</li>
              <li>Mogadishu, Somalia</li>
            </ul>
          </div>
        </div>

        {/* Social Icons + Copyright in one line */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex space-x-3 mb-2 sm:mb-0">
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              <FaFacebook size={14} />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              <FaTwitter size={14} />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              <FaInstagram size={14} />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
              <FaYoutube size={14} />
            </a>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right">
            © {new Date().getFullYear()} FAARUUQ Books. All rights reserved. By jaabirshuuke26@gmail.com
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;