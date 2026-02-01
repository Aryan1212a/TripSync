import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import Slider from "react-slick";
import { motion } from "framer-motion";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./premiumCarousel.css";

export default function PopularCarousel() {
  const [banners, setBanners] = useState([]);
  const sliderRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/packages?limit=6");
        setBanners(res.data || []);
        // wait a tick so CSS/layout stabilizes before Slick calculates sizes
        setTimeout(() => setReady(true), 50);
      } catch (e) {
        console.error("banner fetch error:", e);
        setReady(true);
      }
    }
    load();

    // also clamp any runaway widths if something else resizes later
    const ro = new ResizeObserver(() => {
      if (sliderRef.current && sliderRef.current.innerSlider) {
        try {
          sliderRef.current.innerSlider.onWindowResized();
        } catch {}
      }
    });
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3500,
    speed: 900,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    adaptiveHeight: false,
    lazyLoad: "ondemand",
    variableWidth: false,
    // ensure slick recalculates properly on init
    onInit: () => {
      if (sliderRef.current && sliderRef.current.innerSlider) {
        try { sliderRef.current.innerSlider.onWindowResized(); } catch {}
      }
    }
  };

  if (!ready) {
    // render a safe container while slick initializes
    return <div className="premium-hero-placeholder" />;
  }

  return (
    <div className="premium-hero-container">
      <Slider ref={sliderRef} {...settings}>
        {banners.map((pkg) => (
          <div key={pkg._id || pkg.title} className="premium-slide">
            <motion.img
              src={pkg.image}
              alt={pkg.title}
              className="premium-img"
              initial={{ scale: 1 }}
              animate={{ scale: 1.03 }}
              transition={{ duration: 6, ease: "easeOut", repeat: Infinity, repeatType: "mirror" }}
              onLoad={() => {
                // after an image loads, nudge slick to recalc widths
                if (sliderRef.current && sliderRef.current.innerSlider) {
                  try { sliderRef.current.innerSlider.onWindowResized(); } catch {}
                }
              }}
            />

            <div className="premium-overlay">
              <h2 className="premium-title">{pkg.title}</h2>
              <p className="premium-subtitle">
                {pkg.description?.substring(0, 100) || "Discover beautiful destinations."}
              </p>
              <div className="premium-chips">
                <span className="chip">{pkg.category || "Travel"}</span>
                <span className="chip">₹{pkg.price}</span>
                <span className="chip green">{pkg.discount || 0}% OFF</span>
              </div>
            </div>

            <div className="premium-gradient" />
          </div>
        ))}
      </Slider>
    </div>
  );
}
