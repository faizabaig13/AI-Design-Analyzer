import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import DesignCard from "~/components/DesignCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Design Evaluator" },
    { name: "description", content: "Smart UX feedback for your designs!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadDesigns = async () => {
      setLoadingDesigns(true);

      const designs = (await kv.list('design:*', true)) as KVItem[];

      const parsedDesigns = designs?.map((design) => (
          JSON.parse(design.value) as Design
      ))

      setDesigns(parsedDesigns || []);
      setLoadingDesigns(false);
    }

    loadDesigns()
  }, []);

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />

    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Design Evaluations</h1>
        <h2>Review your design submissions and check AI-powered UX feedback.</h2>
</div>
    </section>
  </main>
}