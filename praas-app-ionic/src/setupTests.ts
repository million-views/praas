// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/dom';
import { mockIonicReact } from '@ionic/react-test-utils';
import MutationObserver from 'mutation-observer';
mockIonicReact();
configure({ testIdAttribute: 'id' });
window.MutationObserver = MutationObserver;
