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
        title="Someone didn’t rewind"
        action={
          <Link to="/" className="btn btn-primary">
            Back to the counter
          </Link>
        }
      >
        This case is empty: the page you’re looking for isn’t on the shelf.
      </StateMessage>
    </main>
  );
}
