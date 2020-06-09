# Code review outcome
- crud-server/model.test.js:
  - unit tests need to be beefed up [issue]
  - bring back unique constraint tests
    - ref: https://github.com/million-views/praas/pull/11/files
    - ensure curi is unique    [issue]
- crud-server/routes.test.js:
  - add a test for curi immutability [issue]
- crud-server/routes/api/conduits.js
  - enforce curi *immutability* [issue]
  - add missing functionality to catch curi collision and retry
- crud-server/routes/api/conduits.js
  - review all methods:
    - to ensure to that all exceptions are caught and handled
    - always return an appropriate status code
    - always return properly formated json response
      - feel free to error message that is helpful for debugging
      - BUT also pay attention to security
- crud-server/server.js
  - demonstrate error logging (which seems to be not working) [issue]

- For a new comer:
  - Interview current developers
    - What are knowns and unknowns
    - What are the dark edges in the code base?
  - At this stage, we are going prioritise on code being the source of truth
  - Good documentation requires design effort...
    - we are going defer that until we achieve functionality

# Desiging for testability
- It's about asking the question, how can we enable unit test first.
- And then how compliant are you with REST specification for integration test.

## Unit Test
- Many definitions out there...
- Our definition: In-proc (direct calling a function)

Example:
 fn (a, b) {
   remote_foo(a, b); // can be RPC (REST, gRPC, ...), but is of no concern to caller
   // return a + b;
 }

 it('should add two numbers' () => {
   assert.equal(foo(5+6), 11));
 });


## Integration Test
- Out-of-proc (functionality tested via a protocol)
```code
route.get('/foo', (req, res) => {
  const a = req.query.a;
  const b = req.query.b;
  // res.status(200).send(a+b); //<- this is bad
  const c = foo(a, b); //<- you are using a unit tested function

  res.status(200).send(c);
});
```

## Sample candidates
unit test:
 - fetch conduits

integration test:
 - GET foo-1.example.com
  