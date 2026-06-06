export default function Quotes() {
  const quotes = [
    {
      quote: "Why so serious?",
      movie: "The Dark Knight",
    },
    {
      quote: "May the Force be with you.",
      movie: "Star Wars",
    },
    {
      quote: "I'll be back.",
      movie: "Terminator",
    },
  ];

  return (
    <section
      style={{
        padding: "100px 50px",
        color: "white",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: "42px",
          marginBottom: "50px",
        }}
      >
        🎬 Famous Movie Quotes
      </h2>

      {quotes.map((item, index) => (
        <div
          key={index}
          style={{
            maxWidth: "900px",
            margin: "20px auto",
            padding: "30px",
            background: "#071226",
            borderRadius: "20px",
          }}
        >
          <h3>"{item.quote}"</h3>
          <p style={{ color: "#00e5b0" }}>
            — {item.movie}
          </p>
        </div>
      ))}
    </section>
  );
}