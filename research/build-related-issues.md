# Build related issues, references, resolutions

## Babel
### ReferenceError: regeneratorRuntime is not defined
I had turned useBuiltIns to off to reduce the size of the release
build since we wanted to target the latest browsers.

Setting useBuiltIns to 'usage' fixed it.

#### References
- https://stackoverflow.com/questions/28976748/regeneratorruntime-is-not-defined
- https://babeljs.io/docs/en/babel-preset-env