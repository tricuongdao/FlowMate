import TaskCard from "./TaskCard";

/** Loading skeletons mirror the card shape so the swap feels seamless. */
function SkeletonCard() {
  return (
    <li className="mb-3">
      <div className="card px-4 py-3.5">
        <div className="flex items-start gap-3.5">
          <div className="skeleton mt-0.5 size-7 rounded-full" />
          <div className="flex-1 space-y-2 py-0.5">
            <div className="skeleton h-3.5 w-2/5" />
            <div className="skeleton h-2.5 w-24 opacity-60" />
          </div>
        </div>
      </div>
    </li>
  );
}

const TaskList = ({ tasks, isLoading, empty }) => {
  if (isLoading) {
    return (
      <ul aria-label="Loading tasks" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </ul>
    );
  }

  if (!tasks.length) return empty;

  return (
    <ul aria-label="Tasks">
      {tasks.map((task, index) => (
        <TaskCard key={task._id} task={task} index={index} />
      ))}
    </ul>
  );
};

export default TaskList;
