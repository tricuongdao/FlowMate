import RackRow from "./RackRow";

/**
 * The register head: names each column once, where a printed register
 * names it. Screen readers get the same information from the row controls,
 * so the head is decorative and stays out of the accessibility tree.
 */
function RackHead() {
  return (
    <div className="rack-head" aria-hidden="true">
      <span className="legend">No</span>
      <span className="legend">Task</span>
      <span className="legend text-right">Due</span>
      <span />
    </div>
  );
}

/** Loading rows keep the row geometry, so the swap does not shift the page. */
function SkeletonRow() {
  return (
    <li className="rack-row">
      <span className="skeleton mt-0.5 size-6" />
      <span className="min-w-0 space-y-2 py-0.5">
        <span className="skeleton block h-3.5 w-2/5" />
        <span className="skeleton block h-2.5 w-24 opacity-60" />
      </span>
      <span className="skeleton mt-0.5 h-3 w-14 justify-self-end" />
      <span />
    </li>
  );
}

export default function Rack({ tasks, isLoading, empty, now }) {
  if (isLoading) {
    return (
      <ul className="rack" aria-label="Loading tasks" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonRow key={i} />
        ))}
      </ul>
    );
  }

  if (!tasks.length) return empty;

  return (
    <div>
      <RackHead />
      <ul className="rack" aria-label="Tasks">
        {tasks.map((task, index) => (
          <RackRow key={task._id} task={task} index={index} now={now} />
        ))}
      </ul>
    </div>
  );
}
