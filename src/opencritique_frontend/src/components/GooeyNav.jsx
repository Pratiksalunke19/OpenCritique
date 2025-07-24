import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./GooeyNav.css";

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
}) => {
  // No refs needed for simple highlight nav
  const location = useLocation();
  const navigate = useNavigate();
  // Set active index based on current route
  const getActiveIndex = () => {
    const idx = items.findIndex(item => location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href)));
    return idx === -1 ? 0 : idx;
  };
  const [activeIndex, setActiveIndex] = useState(getActiveIndex());


  const handleClick = (e, index, href) => {
    e.preventDefault();
    if (activeIndex === index) return;
    setActiveIndex(index);
    navigate(href);
  };

  const handleKeyDown = (e, index, href) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e, index, href);
    }
  };

  // Update active index on route change
  useEffect(() => {
    const idx = getActiveIndex();
    setActiveIndex(idx);
  }, [location.pathname]);

  return (
    <nav className="gooey-nav-container simple-nav">
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className={activeIndex === index ? "active" : ""}
          >
            <a
              href={item.href}
              onClick={e => handleClick(e, index, item.href)}
              onKeyDown={e => handleKeyDown(e, index, item.href)}
              tabIndex={0}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default GooeyNav;
