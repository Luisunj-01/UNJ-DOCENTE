// LoaderFullScreen.jsx
import React from "react";

export default function LoaderFullScreen({ visible }) {
  if (!visible) return null;
  return (
    <div className="loader-overlay">
      <div className="loader-spinner"></div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },
  spinner: {
    width: "70px",
    height: "70px",
    border: "8px solid #f3f3f3",
    borderTop: "8px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  }
};
