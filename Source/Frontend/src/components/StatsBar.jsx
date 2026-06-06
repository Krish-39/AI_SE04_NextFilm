import {
  Bot,
  Clapperboard,
  Heart,
  Zap,
} from "lucide-react";

import { motion } from "framer-motion";

export default function StatsBar() {
  const stats = [
    {
      icon: Bot,
      number: "AI Powered",
      label: "Smart Recommendations",
      color: "#8b5cf6",
    },
    {
      icon: Clapperboard,
      number: "1M+",
      label: "Movies Available",
      color: "#06b6d4",
    },
    {
      icon: Heart,
      number: "Watchlist",
      label: "Save Favorites",
      color: "#ec4899",
    },
    {
      icon: Zap,
      number: "Instant",
      label: "Movie Discovery",
      color: "#f59e0b",
    },
  ];

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 80,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.8,
      }}
      style={{
        width: "100%",
        padding: "60px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg,#071126,#0A1733)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          overflow: "hidden",
          boxShadow:
            "0 0 40px rgba(124,58,237,0.15)",
          backdropFilter: "blur(20px)",
        }}
      >
        {stats.map((item, index) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.5,
              delay: index * 0.15,
            }}
            whileHover={{
              y: -8,
              scale: 1.03,
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              padding: "35px",
              cursor: "pointer",

              borderRight:
                index !== stats.length - 1
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "none",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${item.color}20`,
                boxShadow: `0 0 20px ${item.color}30`,
              }}
            >
              <item.icon
                size={36}
                strokeWidth={1.8}
                color={item.color}
              />
            </div>

            <div>
              <div
                style={{
                  color: "white",
                  fontSize: "34px",
                  fontWeight: "700",
                  lineHeight: "1",
                  marginBottom: "8px",
                }}
              >
                {item.number}
              </div>

              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "17px",
                }}
              >
                {item.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}