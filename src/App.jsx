import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import Home from "./pages/Home";

const Title = lazy(() => import("./pages/Title"));
const Search = lazy(() => import("./pages/Search"));
const Browse = lazy(() => import("./pages/Browse"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const NotFound = lazy(() => import("./pages/NotFound"));

const BARE = ["/login", "/signup"];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const bare = BARE.includes(pathname);

  return (
    <>
      <ScrollToTop />
      {!bare && <SiteHeader />}
      <Suspense fallback={<div className="page" aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<Title kind="movie" />} />
          <Route path="/tv/:id" element={<Title kind="tv" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/browse" element={<Browse />} />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!bare && <SiteFooter />}
    </>
  );
}
