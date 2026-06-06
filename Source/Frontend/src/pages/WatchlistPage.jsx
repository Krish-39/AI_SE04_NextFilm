import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Watchlist from "../components/Watchlist";

export default function WatchlistPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#050816",
        minHeight: "100vh",
      }}
    >
      {/* Netflix Style Back Button */}
      <div
        style={{
          padding: "25px 40px 0",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "12px 20px",
            borderRadius: "50px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "rgba(255,255,255,0.15)";
            e.currentTarget.style.transform =
              "translateX(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "rgba(255,255,255,0.08)";
            e.currentTarget.style.transform =
              "translateX(0)";
          }}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>
      </div>

      <Watchlist />
    </div>
  );
}