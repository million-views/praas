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
  - Good documentation requires design effort...
    - we are going to defer that until we achieve functionality
    - and depend on code being the source of truth for now
    - and concede this decision will add to technical debt

# Design for testability
- Ask the question: how can we organize code into functions such that:
  - each function as much as feasible is parameterized to accept primitive parameters
  - can be unit tested dependency free
  - user of a function can invoke the function without requiring elaborate setup
- Be consistent at the REST layer
  - do validation and parameter checks 
  - and delegate to unit tested functions
  - return well formed json and appropriate status code
- Each layer is responsible for enforcing its contract
  - reject violations with appropriate error/status code or exceptions
  - do *not* attempt to fix the received data, unless it is a requirement
  - handle errors from downstream when expected (e.g UniqueConstraintViolation)

## Unit Test
- Many definitions out there...
- Our definition: In-proc (directly calling a function)
- Testing data layer is considered a unit test
  - test for constraints (not null, unique, ...)
  - do not introduce computational setters at the ORM layer
- Typically unit tests test code that is passive or of run-to-completion kind


Example:
```code
// add two numbers
// can be RPC (REST, gRPC, ...), but is of no concern to caller
// as long as it runs to completion to produce a deterministic result
function foo(a, b) {
  return remote_foo(a, b); //<- a remote call
  // return a + b; //<- local compute
}

// This test requires no additional setup other than to import `foo`
it('should add two numbers' () => {
  assert.equal(foo(5+6), 11));
});
```

## Integration Test
- Out-of-proc (functionality tested via a protocol)
- Typically involves testing an active component such as a server
- Requires more elaborate test setup

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
  