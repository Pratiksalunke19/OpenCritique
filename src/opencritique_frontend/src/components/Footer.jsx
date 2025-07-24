// src/components/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-bg-panel text-text-muted px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between w-full">
          {/* Logo Left */}
          <div className="text-left w-full md:w-auto mb-4 md:mb-0 flex-shrink-0">
            <h2 className="text-white text-4xl font-bold mb-1">OpenCritique</h2>
            <p className="text-xs">A Decentralized Art Feedback DAO</p>
          </div>

          {/* Contact Us Right */}
          <div className="flex flex-col items-end w-full md:w-auto">
            <h4 className="font-semibold text-text-base mb-2 text-lg">
              Contact Us
            </h4>
            <div className="flex items-center gap-2">
              {/* Mail SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.09 7.09a2.25 2.25 0 01-3.182 0l-7.09-7.09A2.25 2.25 0 012.25 6.993V6.75"
                />
              </svg>
              <a href="mailto:pratiksalunke1905@gmail.com" className="text-white hover:underline">pratiksalunke1905@gmail.com</a>
            </div>
            <div className="flex items-center gap-2">
              {/* Phone SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h.75a2.25 2.25 0 002.25-2.25v-2.25a.75.75 0 00-.75-.75h-3.063a.75.75 0 00-.75.648l-.375 2.25a11.978 11.978 0 01-7.478-7.478l2.25-.375a.75.75 0 00.648-.75V3.75a.75.75 0 00-.75-.75H4.5A2.25 2.25 0 002.25 5.25v1.5z"
                />
              </svg>
              <a href="tel:+917738746245" className="text-white hover:underline">+91 77387 46245</a>
            </div>
            {/* Social Icons */}
            <div className="flex justify-end mt-4 gap-4">
              {/* X.com */}
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X.com"
                className="inline-flex items-center"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 1200 1227"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white hover:text-primary transition"
                >
                  <path
                    d="M1199.97 0.000244141H1092.6L599.985 529.5L107.37 0.000244141H0.0299988L491.25 522.75L0 1226.25H107.37L599.985 696.75L1092.6 1226.25H1199.97L708.75 703.5L1199.97 0.000244141ZM599.985 613.5L1062.6 1152.75H937.5L599.985 783.75L262.47 1152.75H137.37L599.985 613.5ZM162.75 74.2502H287.85L599.985 414.75L912.12 74.2502H1037.22L599.985 567.75L162.75 74.2502Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex items-center"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white hover:text-primary transition"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                </svg>
              </a>
              {/* Discord */}
              <a
                href="https://discord.gg/wBxmyWWC"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="inline-flex items-center"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white hover:text-primary transition"
                >
                  <path
                    d="M20.317 4.3698A19.7913 19.7913 0 0 0 16.885 3.1a.0741.0741 0 0 0-.0785.0371c-.342.6071-.7247 1.3957-.9977 2.0107-2.957-.4438-5.887-.4438-8.832 0-.273-.6305-.6557-1.4036-.9987-2.0107A.077.077 0 0 0 6.1169 3.1c-1.4784.2512-2.9007.6376-4.2862 1.2698a.0699.0699 0 0 0-.0321.0277C.5334 6.0246-.319 9.0476.0992 12.032c.0022.017.0106.0334.023.0452 1.9938 1.4576 3.9467 2.3496 5.8681 2.9406a.0777.0777 0 0 0 .0842-.0276c.4516-.6156.8497-1.2656 1.1887-1.9436a.076.076 0 0 0-.0416-.1047c-.6528-.2476-1.2743-.5492-1.8722-.8922a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276c-.598.343-1.2195.6446-1.8723.8922a.0766.0766 0 0 0-.0406.1057c.3606.677.7587 1.327 1.1897 1.9426a.076.076 0 0 0 .0842.0286c1.9224-.591 3.8753-1.483 5.8691-2.9406a.077.077 0 0 0 .0229-.0452c.5004-3.4516-.8382-6.4296-2.5482-7.9341a.061.061 0 0 0-.0312-.0286ZM8.02 14.3312c-1.1822 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0957 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189Zm7.9748 0c-1.1822 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0957 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              {/* GitHub */}
              <a
                href="https://github.com/Pratiksalunke19/OpenCritique"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex items-center"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white hover:text-primary transition"
                >
                  <path
                    d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.48C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full">
        <p className="text-xs w-full text-center justify-center mt-6">
          &copy; {new Date().getFullYear()} OpenCritique. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
