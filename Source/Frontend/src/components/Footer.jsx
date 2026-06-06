import {
  FaFacebookF,
  FaInstagram,
  FaGithub,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{
        opacity: 0,
        y: 100,
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
        background:
          "linear-gradient(180deg,#071126,#050B18)",
        color: "#9ca3af",
        padding: "70px 60px",
        borderTop:
          "1px solid rgba(255,255,255,0.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow Background */}
      <div
        style={{
          position: "absolute",
          top: "-150px",
          right: "-150px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,.18), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns:
            "2fr 1fr 1fr 1fr 2fr",
          gap: "40px",
        }}
      >
        {/* Logo */}
        <div>
          <h2
            style={{
              color: "white",
              marginBottom: "15px",
            }}
          >
            🎬 NextFilm{" "}
            <span
              style={{
                color: "#00E5A8",
              }}
            >
              AI
            </span>
          </h2>

          <p
            style={{
              lineHeight: "1.8",
            }}
          >
            AI-powered movie
            recommendation platform
            that understands your
            taste better than ever.
          </p>

          <div
            style={{
              display: "flex",
              gap: "18px",
              marginTop: "25px",
            }}
          >
            {[
              {
                icon: FaFacebookF,
                link:
                  "https://facebook.com",
              },
              {
                icon: FaXTwitter,
                link: "https://x.com",
              },
              {
                icon: FaInstagram,
                link:
                  "https://instagram.com",
              },
              {
                icon: FaGithub,
                link:
                  "https://github.com",
              },
            ].map(
              (
                item,
                index
              ) => (
                <motion.a
                  key={index}
                  href={
                    item.link
                  }
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{
                    y: -6,
                    scale: 1.15,
                  }}
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius:
                      "12px",
                    background:
                      "rgba(255,255,255,.05)",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    color:
                      "white",
                    textDecoration:
                      "none",
                  }}
                >
                  <item.icon />
                </motion.a>
              )
            )}
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3
            style={{
              color: "white",
              marginBottom: "15px",
            }}
          >
            Explore
          </h3>

          <p>Movies</p>
          <p>Categories</p>
          <p>Top Rated</p>
          <p>Trending</p>
        </div>

        {/* Support */}
        <div>
          <h3
            style={{
              color: "white",
              marginBottom: "15px",
            }}
          >
            Support
          </h3>

          <p>Help Center</p>
          <p>Contact Us</p>
          <p>FAQ</p>
          <p>Privacy Policy</p>
        </div>

        {/* Company */}
        <div>
          <h3
            style={{
              color: "white",
              marginBottom: "15px",
            }}
          >
            Company
          </h3>

          <p>About Us</p>
          <p>Blog</p>
          <p>Careers</p>
        </div>

        {/* Newsletter */}
        <motion.div
          whileHover={{
            y: -5,
          }}
          style={{
            padding: "25px",
            borderRadius: "20px",
            background:
              "rgba(255,255,255,.04)",
            border:
              "1px solid rgba(255,255,255,.08)",
            backdropFilter:
              "blur(15px)",
          }}
        >
          <h3
            style={{
              color: "white",
              marginBottom: "15px",
            }}
          >
            Stay in the Loop
          </h3>

          <p
            style={{
              marginBottom: "15px",
            }}
          >
            Get the latest updates,
            movie recommendations
            and more.
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              placeholder="Your email"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius:
                  "10px",
                border:
                  "1px solid rgba(255,255,255,.1)",
                background:
                  "#0f172a",
                color:
                  "white",
                outline:
                  "none",
              }}
            />

            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              style={{
                border: "none",
                padding:
                  "12px 18px",
                borderRadius:
                  "10px",
                color:
                  "white",
                cursor:
                  "pointer",
                fontWeight:
                  "600",
                background:
                  "linear-gradient(135deg,#00E5A8,#7C3AED)",
              }}
            >
              Subscribe
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Bottom */}
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          paddingTop: "25px",
          borderTop:
            "1px solid rgba(255,255,255,0.08)",
          color: "#6b7280",
          position: "relative",
          zIndex: 2,
        }}
      >
        © 2026 NextFilm AI.
        All rights reserved.
      </div>
    </motion.footer>
  );
}