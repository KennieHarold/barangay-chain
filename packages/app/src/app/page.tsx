import { Navbar } from "@/components/Navbar";
import { Dashboard } from "@/components/Dashboard";
import { ProjectsList } from "@/components/ProjectsList";

export default function Home() {
  return (
    <div className="font-sans">
      <Navbar />
      <Dashboard />
      <ProjectsList />
    </div>
  );
}
