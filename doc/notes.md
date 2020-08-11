NOTES
=====

The doc folder holds documentation that goes into the details of
the project. At a minimum strive to create a log of the technical
decisions and discussions made as the project progresses.

At the moment this file contains quick notes and thoughts that need
to be expounded at some point in time.

## React specific conventions
  - Put things where they belong
  - Organize `import` statements from least likely to change to most likely
    to change. Further organize import statements into two groups:
    - external dependencies come first
    - internal dependencies next
    - separate the two groups with a single blank line
  - avoid class components
  - use hooks but also don't go crazy in converting everything into a hook
  - write tests based on use cases and test for functionality instead of
    visual appearances
  - `components`, `hooks` and `lib` folders are special. Stuff gets in here
    iff code **will** be used by **`many`**. If you decide to move code into
    any of these three folders then consider the following:
    - these folders are specific to this project. So do not waste time
      in trying to `design` them for a wider audience.
    - we use redux for this project which maintains global state of the
      application
    - avoid prop drill downs but also don't agonize on how to avoid props
    - since we use redux and want to avoid prop drill downs, feel free to
      include redux as a dependency in your `component`; remember that this
      component is application specific. Time spent on making it `generic`
      could be used on more important and urgent tasks.
    - containers and components:
      - some components have multiple facets (parts of a whole); when it is
        obvious then it is best to create a folder named after the component
        to be the `container` and have a named file for each part inside
        this folder.
      - if a component has only one facet then it is best to implement the
        component in a single file and place it under `components` itself.
      - if in the future the component grows it can get its own container.
    - consistency is important but dumb consistency is considered harmful
  - please have a discussion before bringing adding external dependencies

## General conventions
### file and folder naming conventions
  - stick to lower case name:  Windows is case insensitive leading to many
    frustrating issues with version control systems when checking out code
    on Windows where one developer uses lower case and another checks in a
    file with upper case starting letter.
  - use kebab-case for names (folders and files) and name them meaningfully.
    For example, "assets/icons/iphone-64x32.png" is better than 
    "assets/icons/iphone-small.png".  In other words convey as much 
    information as you can with your name, **without** introducing 
    redundancy
  - Use meaningful names even if it results in longer names. For example,
   "images/agile-transformation.svg" is better than 
   "images/Agile-trans.svg".
  - a folder is a container - use it minimally, judiciously and when 
    possible for semantic reasons, and not purely for organization. Take a
    look at your kitchen. I am sure you will be able to identify various
    containers of various shapes serving different functions.
  - Try to keep the containment hierarchy between 3 - 5; this is where
    semantic matters; navigability trumps organization. For example,
    "public/assets/images" containing all image sizes is better than
    "public/assets/images/small", "public/assets/images/medium" and 
    "public/assets/images/large".

### code conventions and standards
  - set your .editorconfig to use spaces and 2 space tab stop everywhere,
    unless the language you are using has special requirements (the most
    famous being Makefile and mail config).
  - Use 1TBS (1 True Brace Style) for code; exception of course is Python
    and its cousins that don't use braces.
  - I personally prefer using semicolons to terminate statements; this can
    avoid a class of errors when you are forced to work in an environment
    without developer tools. For example, when you are in operations and
    have to edit code for a hot patch using the dumbest editor available,
    sticking to the practice of using semicolons and spaces (instead of 
    tabs) can get you out of the bind more quickly.
  - Modern editors have spoiled us tremendously. Think again of the DevOps
    person looking at your code in a production environment without the
    luxury of having VS Code handy. They will appreciate if you can keep
    your statements to be less than 80 characters per line.

## Issues stumbled upon
### Reach router adds additional div that messess up styling
References:
- https://github.com/gatsbyjs/gatsby/issues/7310
- https://github.com/reach/router/issues/63#issuecomment-428050999

### Material icons lacking login/logout/signup icons
- https://github.com/google/material-design-icons/issues/286