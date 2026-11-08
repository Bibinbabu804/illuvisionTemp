/**
 * Route transition: each page rises in softly on navigation. Pure CSS
 * (see .page-enter in globals.css) so content is never held hidden
 * waiting for JavaScript.
 */
export default function Template({ children }) {
  return <div className="page-enter">{children}</div>;
}
