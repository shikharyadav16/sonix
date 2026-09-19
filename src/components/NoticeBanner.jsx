import React, { useState } from "react";
import { Info, X } from "lucide-react";

export function NoticeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="notice-banner">
      <div className="notice-content">
        <div className="notice-icon-wrapper">
          <Info size={18} color="#eab308" />
        </div>
        <div className="notice-text-group">
          <span className="notice-heading">Notice</span>
          <p className="notice-message">
            We can’t add new artists or songs here right now.
          </p>
        </div>
      </div>

      <button
        id="dismiss-notice-btn"
        type="button"
        className="notice-close-btn"
        onClick={() => setIsVisible(false)}
        title="Dismiss notice"
      >
        <X size={16} />
      </button>
    </div>
  );
}
