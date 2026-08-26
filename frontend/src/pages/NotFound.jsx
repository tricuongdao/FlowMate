import { Link } from "react-router";

/**
 * 404: brief, on-brand, one obvious exit. No sad illustrations.
 */
const NotFound = () => (
  <div className="grid min-h-dvh place-items-center px-6">
    <div className="backdrop-aurora" aria-hidden="true" />
    <div className="page-enter text-center">
      <p className="display text-7xl font-semibold text-flow-600 dark:text-flow-400 tnum">
        404
      </p>
      <h1 className="mt-3 text-lg font-semibold">This page drifted off-flow</h1>
      <p className="mt-1.5 max-w-xs text-sm text-muted">
        The address doesn't match anything here.
      </p>
      <Link to="/" className="btn btn-primary mt-7 h-10 px-5 text-sm">
        Back to your tasks
      </Link>
    </div>
  </div>
);

export default NotFound;
