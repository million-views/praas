# Sharding, hashes, collisions
[03JAN2019]
- decided to use Nano ID

# Register, Sign in flow for v1
[13JAN2019]
- go to login after registration
- backlog for v2:
  - a different approach would be to take the user through the app
    in a walkthrough mode, and at the end of it show a popup to complete
    the user registration by inputing the code that provided in the
    confirmation email that got sent during registration;

    upon confirmation redirect the user to main conduits screen.

    Note: some flows require the user to click a link in the received
    e-mail; I have noticed that this results in suboptimal experience
    since doing so opens a new browser/tab which leads to confusion
    on where the flow should pick up.

# Forms, forms, forms
[17JAN2019]
- Decided to go with Formik for the following reasons:
  - Stick to "just React" philosophy (as much as possible) so that:
    - Easy to understand
    - Easy to debug
    - Easy to optimize
    - Easy to delete
  - Make it easy to adopt/delete
  - Solve for the 80% use case; trying to solve for the remaining
    can lead to significant bloat
  - No magic

# Code cleanliness
## Fat arrow vs bind in components
[14JAN2019]
### Discussion
- https://stackoverflow.com/questions/41381720/when-using-react-is-it-preferable-to-use-fat-arrow-functions-or-bind-functions-i
- [Use arrow functions or bind manually in es6 classes? Any performance difference?](https://github.com/facebook/react/issues/9851)
- https://medium.com/@charpeni/arrow-functions-in-class-properties-might-not-be-as-great-as-we-think-3b3551c440b1
- https://github.com/tc39/proposal-class-fields

### Conclusion
Even though arrow function properties look elegant there seems to be
good amount of evidence to suggest that there is a performance hit if
a class will have N instances, where N is a large number.

On balance the discussion is about passing handlers up and down the
chain. We are in 2019 and the proposal is stage 3 and on track for
adoption by major browsers.

It's a 50/50 call on this one. Favoring minimal code size, we recommend
avoiding class properties feature until it is available natively. So,
avoid fat arrow methods in classes. But don't let this stop you from
using them when code comprehension and context dictate their use.


