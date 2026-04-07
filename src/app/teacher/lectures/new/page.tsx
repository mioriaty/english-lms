import { NewLectureForm } from "./new-lecture-form";

export default function NewLecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">New Lecture</h1>
        <p className="text-xl text-muted-foreground">Create a new lecture.</p>
      </div>
      <NewLectureForm />
    </div>
  );
}
