import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BookingApp } from "./BookingApp";
import "./booking.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BookingApp />
  </StrictMode>
);
