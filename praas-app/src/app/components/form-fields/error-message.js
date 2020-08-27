import React from 'react';

// Experimental
function _get(object, path, defaultValue) {
  // function arr_deref(o, ref, i) {
  //   return !ref ? o : (o[ref.slice(0, i ? -1 : ref.length)]);
  // };
  function isObject(o) {
    return o && typeof object === 'object';
  }

  function isObjectEmpty(o) {
    return Object.entries(o).length === 0;
  }

  function arr_deref(o, ref, i) {
    return !ref
      ? o && Object
      : (o[(ref.slice(0, i ? -1 : ref.length)).replace(/^['"]|['"]$/g, '')]);
  }

  function dot_deref(o, ref) {
    return ref.split('[').reduce(arr_deref, o);
  }

  if (isObject(object) === false || isObjectEmpty(object) === true || !path) {
    return defaultValue;
  }

  return path.split('.').reduce(dot_deref, object);
};

/*
Usage:
You can use `ErrorMessage` independent of react-hook-forms. Examples below
illustrate usage with react-hook-forms for context. `errors` is an object
keyed by the field name with the following shape:
```code
  "firstName": {
    "message": "firstName is a required field",
    "type": "required"
  }
```

```code
...
<input name="reason-code" ref={register({ required: true })} />
<ErrorMessage
  errors={errors}
  name="reason-code"
  message="Reason code is required"/>
...
```

```code
<input
  name="status" ref={register({ required: "Conduit state is required" })} />
<ErrorMessage errors={errors} name="status"  />
```code
*/
export function ErrorMessage({ name, errors, message }) {
  // if message is present then it overrides default received in `errors`
  // return JSX iff name is found in `errors`

  let jsx = null;
  if (errors ?? Object.entries(errors).length) {
    // console.log('!!!!! name: ', name, ' errors: ', errors, ' message: ');
    const errorRecord = _get(errors, name, message);

    if (errorRecord?.message) {
      jsx = <h6 className="error">{errorRecord.message}</h6>;
    }
  }

  return jsx;
};
