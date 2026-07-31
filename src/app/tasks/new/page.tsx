import { requireCustomer } from "@/lib/auth";
import TaskWizard from "@/components/tasks/TaskWizard";

export default async function NewTaskPage() {
  await requireCustomer();

  return (
    <div className="container mx-auto py-8 px-4">
      <TaskWizard />
    </div>
  );
}