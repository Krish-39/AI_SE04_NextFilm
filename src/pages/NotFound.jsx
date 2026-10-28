import { Link } from "react-router-dom";
import { Clapperboard } from "lucide-react";

import StateMessage from "../components/StateMessage";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <main id="main" className="page">
      <StateMessage
        icon={Clapperboard}
        title="This scene was cut"
        action={
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
        }
      >
        The page you’re looking for doesn’t exist.
      </StateMessage>
    </main>
  );
}
