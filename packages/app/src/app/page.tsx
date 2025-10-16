import { Navbar } from "@/components/Navbar";
import { ProjectsList } from "@/components/ProjectsList";

export default function Home() {
  return (
    <div className="font-sans">
      <Navbar />
      <ProjectsList />
    </div>
  );
}
