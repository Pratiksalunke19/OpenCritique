// src/components/Footer.jsx
import React from 'react';
import {
  FaFacebookF,
  FaTwitter,
  FaRss,
  FaGooglePlusG,
  FaFlickr,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-bg-panel text-text-muted px-6 py-12">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
        {/* Logo */}
        <div>
          <h2 className="text-white text-lg font-bold mb-1">OpenCritique</h2>
          <p className="text-xs">A Decentralized Art Feedback DAO</p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-text-base mb-2">Weebly Themes</h4>
          <ul className="space-y-1">
            <li><a href="#">Pre-sale FAQs</a></li>
            <li><a href="#">Submit a Ticket</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-text-base mb-2">Services</h4>
          <ul className="space-y-1">
            <li><a href="#">Theme Tweak</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-text-base mb-2">Showcase</h4>
          <ul className="space-y-1">
            <li><a href="#">WidgetKit</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-text-base mb-2">About</h4>
          <ul className="space-y-1">
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Affiliates</a></li>
            <li><a href="#">Resources</a></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-10 border-border" />

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto text-center space-y-4">
        <div className="flex justify-center space-x-4 text-white text-lg">
          <FaFacebookF className="hover:text-primary transition" />
          <FaTwitter className="hover:text-primary transition" />
          <FaRss className="hover:text-primary transition" />
          <FaGooglePlusG className="hover:text-primary transition" />
          <FaFlickr className="hover:text-primary transition" />
        </div>
        <p className="text-xs">&copy; {new Date().getFullYear()} OpenCritique. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
