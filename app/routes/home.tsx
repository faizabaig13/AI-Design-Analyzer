import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import DesignCard from "~/components/DesignCard";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Design Evaluator" },
    { name: "description", content: "Smart UX feedback for your designs!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  useEffect(() => {
    // Load saved designs (stub logic, since Puter is removed)
    const loadDesigns = async () => {
      setLoadingDesigns(true);

      // Example: load mock or localStorage data instead of kv.list
      const saved = localStorage.getItem("designs");
      const parsedDesigns = saved ? (JSON.parse(saved) as Design[]) : [];

      setDesigns(parsedDesigns);
      setLoadingDesigns(false);
    };

    loadDesigns();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1 className="text-6xl">Track Your Design Evaluations</h1>
          <h2 className="text-3xl">
            Review your design submissions and check AI-powered UX feedback.
          </h2>
        </div>

      </section>
    </main>
  );
}
