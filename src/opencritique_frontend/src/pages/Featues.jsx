import { Database } from "lucide-react";
import { Coins } from "lucide-react";
import { Star } from "lucide-react";
import { Gavel } from "lucide-react";
import { Target } from "lucide-react";
import { FlaskConical } from "lucide-react";
import { useEffect, useState } from "react";

const Features = () => {
  const features = [
    {
      title: "Decentralized Storage",
      description:
        "Artworks and critiques are stored on-chain via the Internet Computer.",
      icon: <Database/>,
    },
    {
      title: "Token Rewards",
      description:
        "Helpful critiques are upvoted and rewarded by the community.",
      icon: <Coins/>,
    },
    {
      title: "On-Chain Reputation",
      description:
        "Critics build profiles showcasing their contributions and expertise.",
      icon: <Star/>,
    },
    {
      title: "DAO Governance",
      description:
        "Community curates featured artworks and governs moderation.",
      icon: <Gavel/>,
    },
    {
      title: "Optional Bounties",
      description:
        "Artists can incentivize critiques by attaching token rewards.",
      icon: <Target/>,
    },
    {
      title: "Work-in-Progress Focus",
      description:
        "Upload early-stage art for meaningful and constructive feedback.",
      icon: <FlaskConical/>
    }
  ];


  // Split features into two rows
  const row1 = features.slice(0, 3);
  const row2 = features.slice(3, 6);

  // State for hovered card index per row
  const [hoveredRow1, setHoveredRow1] = useState(null);
  const [hoveredRow2, setHoveredRow2] = useState(null);

  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('features-marquee-css')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'features-marquee-css';
      styleSheet.innerHTML = `
        .features-marquee-outer {
          width: 100%;
          overflow: hidden;
          display: flex;
          justify-content: center;
          position: relative;
          mask-image: linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%);
        }
        .features-marquee-row {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
        }
        .features-marquee-row .feature-card {
          min-width: 320px;
          margin-right: 32px;
        }
        .features-marquee-right {
          animation: marquee-right-center 18s linear infinite;
        }
        .features-marquee-left {
          animation: marquee-left-center 18s linear infinite;
        }
        .features-marquee-row:hover {
          animation-play-state: paused !important;
        }
        .feature-title-orange {
          color: #FFA500 !important;
        }
        @keyframes marquee-right-center {
          0% { transform: translateX(0); }
          100% { transform: translateX(33.333%); }
        }
        @keyframes marquee-left-center {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  return (
    <section className="py-20 px-6 mt-13 bg-panel text-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-12">
          Platform Features
        </h2>
        <div className="space-y-8">
          {/* First row: moves right, centered */}
          <div className="features-marquee-outer">
            <div
              className="features-marquee-row features-marquee-right"
              onMouseLeave={() => setHoveredRow1(null)}
            >
              {[...row1, ...row1, ...row1].map((feature, idx) => (
                <div
                  key={idx}
                  className="feature-card bg-[#1A2B4C] p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
                  style={{ zIndex: 2 }}
                  onMouseEnter={() => setHoveredRow1(idx)}
                  onMouseLeave={() => setHoveredRow1(null)}
                >
                  <div className="w-full flex justify-center items-center text-4xl mb-4">{feature.icon}</div>
                  <h3
                    className={`text-xl font-semibold mb-2${hoveredRow1 === idx ? ' feature-title-orange' : ''}`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Second row: moves left, centered */}
          <div className="features-marquee-outer">
            <div
              className="features-marquee-row features-marquee-left"
              onMouseLeave={() => setHoveredRow2(null)}
            >
              {[...row2, ...row2, ...row2].map((feature, idx) => (
                <div
                  key={idx}
                  className="feature-card bg-[#1A2B4C] p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
                  style={{ zIndex: 2 }}
                  onMouseEnter={() => setHoveredRow2(idx)}
                  onMouseLeave={() => setHoveredRow2(null)}
                >
                  <div className="w-full flex justify-center items-center text-4xl mb-4">{feature.icon}</div>
                  <h3
                    className={`text-xl font-semibold mb-2${hoveredRow2 === idx ? ' feature-title-orange' : ''}`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
