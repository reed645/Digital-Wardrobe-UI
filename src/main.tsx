
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  function PhoneFrame({ children }: { children: React.ReactNode }) {
    return (
      <div className="phone-frame-root">
        <div className="phone-frame-container">
          {children}
        </div>
      </div>
    );
  }

  createRoot(document.getElementById("root")!).render(
    <PhoneFrame>
      <App />
    </PhoneFrame>
  );
  