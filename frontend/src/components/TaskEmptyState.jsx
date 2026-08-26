/**
 * Empty states: one illustration, three messages. The orbiting dot is the
 * only ambient motion in the app: slow (6s), opacity-based under reduced
 * motion. Delight budget spent here because empty states are rare.
 */
const EmptyState = ({ scope = "all" }) => {
  const copy = {
    all: {
      title: "A clear desk",
      body: "Nothing on your list yet. Add the first thing you want to get done.",
    },
    active: {
      title: "All clear",
      body: "No ongoing tasks. Enjoy it, or add the next thing.",
    },
    complete: {
      title: "Nothing finished yet",
      body: "Completed tasks land here, with the day you closed them.",
    },
    search: {
      title: "No matches",
      body: "Try a different word, or clear the search.",
    },
  }[scope];

  return (
    <div className="py-14 text-center">
      <div className="relative mx-auto mb-5 size-16" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border border-border" />
        <div className="empty-orbit absolute inset-0">
          <span className="absolute -top-[3px] left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-flow-500" />
        </div>
      </div>
      <h3 className="display text-lg font-semibold">{copy.title}</h3>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">{copy.body}</p>
    </div>
  );
};

export default EmptyState;
