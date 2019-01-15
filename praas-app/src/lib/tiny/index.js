/**
 * A collection of tiny functions that are not worth the weight
 * of package management and are better suited to just be included
 * in their source form...
 *
 * NOTE: Attribution for functions that were taken from the FOSS community
 * can be found in ATTRIBUTION.md
 */

/**
* Tiny replacement for classnames, without variable argument list
* support. User must supply list of classes in an array.
*
* @param {*} classes
*/
export function cx(classes) {
  let out = ''; const type = typeof classes;
  // console.log('cx: ', classes);
  // terminate recursion sooner
  if (classes) {
    if (type === 'string' || type === 'number') {
      return classes || '';
    }

    if (Array.isArray(classes) && classes.length > 0) {
      for (let i = 0, len = classes.length; i < len; i++) {
        const next = cx(classes[i]);
        if (next) {
          out += (out && ' ') + next;
        }
      }
    } else {
      for (const [key, value] of Object.entries(classes)) {
        console.log(key, '->', value);
        if (value) {
          out += (out && ' ') + key;
        }
      }
    }
  }

  // console.log('cx.out', out);
  return out;
}
