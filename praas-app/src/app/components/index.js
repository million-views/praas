/**
 * By default export all `single` concern components that get created
 * in this folder.
 *
 * This is orthogonal to getting treeshaking to working properly,
 * where the recommended practice is to only import what you need
 * directly.
 */
import Header from './header';
import Alert from './alert';

// Only export `single` concern components. Components that are
// containers have their own `index`.
export { Header, Alert };
