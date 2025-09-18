// src/components/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border animate-fade-in">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="url(#footer-logo-gradient)" fillOpacity="0.15"/>
                <path d="M12 16C12 13.7909 13.7909 12 16 12H24C26.2091 12 28 13.7909 28 16V24C28 26.2091 26.2091 28 24 28H16C13.7909 28 12 26.2091 12 24V16Z" fill="url(#footer-logo-gradient)" />
                <circle cx="20" cy="20" r="4" fill="white" fillOpacity="0.9"/>
                <path d="M16 16H24L20 24L16 16Z" fill="white" fillOpacity="0.5" />
                <defs>
                  <linearGradient id="footer-logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8b5cf6"/>
                    <stop offset="0.5" stopColor="#f59e0b"/>
                    <stop offset="1" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-heading font-bold text-xl text-foreground">
                OpenCritique
              </span>
            </div>
            <p className="text-muted-foreground mb-4 leading-relaxed max-w-md">
              Empowering artists through decentralized critique and Web3 innovation.
            </p>

            {/* Contact Info */}
            <div className="mb-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Email:</span>{" "}
                <a href="mailto:pratiksalunke1905@gmail.com" className="hover:text-primary transition-colors">
                  pratiksalunke1905@gmail.com
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Phone:</span>{" "}
                <a href="tel:+917738746245" className="hover:text-primary transition-colors">
                  +91 77387 46245
                </a>
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M1199.97 0.000244141H1092.6L599.985 529.5L107.37 0.000244141H0.0299988L491.25 522.75L0 1226.25H107.37L599.985 696.75L1092.6 1226.25H1199.97L708.75 703.5L1199.97 0.000244141ZM599.985 613.5L1062.6 1152.75H937.5L599.985 783.75L262.47 1152.75H137.37L599.985 613.5ZM162.75 74.2502H287.85L599.985 414.75L912.12 74.2502H1037.22L599.985 567.75L162.75 74.2502Z"/></svg>
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
              </a>
              <a href="https://discord.gg/wBxmyWWC" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="hover:text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698A19.7913 19.7913 0 0 0 16.885 3.1a.0741.0741 0 0 0-.0785.0371c-.342.6071-.7247 1.3957-.9977 2.0107-2.957-.4438-5.887-.4438-8.832 0-.273-.6305-.6557-1.4036-.9987-2.0107A.077.077 0 0 0 6.1169 3.1c-1.4784.2512-2.9007.6376-4.2862 1.2698a.0699.0699 0 0 0-.0321.0277C.5334 6.0246-.319 9.0476.0992 12.032c.0022.017.0106.0334.023.0452 1.9938 1.4576 3.9467 2.3496 5.8681 2.9406a.0777.0777 0 0 0 .0842-.0276c.4516-.6156.8497-1.2656 1.1887-1.9436a.076.076 0 0 0-.0416-.1047c-.6528-.2476-1.2743-.5492-1.8722-.8922a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276c-.598.343-1.2195.6446-1.8723.8922a.0766.0766 0 0 0-.0406.1057c.3606.677.7587 1.327 1.1897 1.9426a.076.076 0 0 0 .0842.0286c1.9224-.591 3.8753-1.483 5.8691-2.9406a.077.077 0 0 0 .0229-.0452c.5004-3.4516-.8382-6.4296-2.5482-7.9341a.061.061 0 0 0-.0312-.0286ZM8.02 14.3312c-1.1822 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0957 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189Zm7.9748 0c-1.1822 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0957 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" fill="currentColor"/></svg>
              </a>
              <a href="https://github.com/Pratiksalunke19/OpenCritique" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.48C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z" fill="currentColor"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="/marketplace" className="text-muted-foreground hover:text-primary transition-colors">Marketplace</a></li>
                <li><a href="/trending" className="text-muted-foreground hover:text-primary transition-colors">Trending</a></li>
                <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="mailto:pratiksalunke1905@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
                <li><a href="https://github.com/Pratiksalunke19/OpenCritique" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">GitHub</a></li>
                <li><a href="https://discord.gg/wBxmyWWC" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Discord</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          {/* Tagline */}
          <div className="lg:col-span-2 flex items-start">
            <div className="text-sm text-muted-foreground">
              Built with ❤️ for artists
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} OpenCritique. All rights reserved.</p>
          <div className="flex items-center gap-4 text-muted-foreground text-xs">
            <a href="mailto:pratiksalunke1905@gmail.com" className="hover:text-primary transition-colors">pratiksalunke1905@gmail.com</a>
            <span className="hidden md:inline">•</span>
            <a href="tel:+917738746245" className="hover:text-primary transition-colors">+91 77387 46245</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
