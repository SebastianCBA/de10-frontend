import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", "G-YNMN1XTRQX", {
        page_path: location.pathname + location.search,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [location]);

  return null;
}