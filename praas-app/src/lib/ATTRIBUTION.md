Use of Open Source Libraries and Components
===========================================
This file contains a list of open source projects used in building this App.

In some cases, rather than use code packages as released by the author(s) we
use the packages in source form when and where appropriate.

Often we install into 'lib' folder in source form whenever one or more of the
following are applicable:
- orginal code is no longer in active maintenance
- code is too small and we could trigger webpack optimizations (in the hope
  that access to source can lead to better optimization)
- when the original code package is too big and we need a small part of it

Regardless of how the libraries and frameworks get used, please list it here
and provide proper attribution which consists of:
- name of the package
- the origin of the source
- author or entity that holds the copyright to the source
- was the source used as is or modified?
- the license of the original source distribution

CAUTION: use only ISC, MIT, BSD licensed source code as a dependency.

Sample Attribution
------------------
- package-name: webpack/loader-utils
- source-origin: https://github.com/webpack/loader-utils/
- copyright-owner: webpack.org
- used-how: in source form, reusing getHashDigest.js
- source-modified: yes
- source-license: MIT

NOTE: packages used from any publicly available registries (such as npm)
do not need to be listed in this file, but still need attribution.
If you find code without attribution in our codebase please add it here
and submit a PR.

NOTE: you should list dependencies and code that gets shipped; which
excludes having the need to list out tools such as webpack, gulp, etc.;
unless some part of the code base as described in the introduction got used.

Code Attributions
=================
CX
--------
- package-name: classcat
- source-origin: 
  - https://github.com/jorgebucaran/classcat
- copyright-owner: Jorge Bucaran
- used-how: in source form, renamed function name to cx
- source-modified: yes
- source-license: MIT

Font Attributions
=================
## Font Awesome
   Copyright (C) 2016 by Dave Gandy
   Author:    Dave Gandy
   License:   SIL ()
   Homepage:  http://fortawesome.github.com/Font-Awesome/
## Typicons
   (c) Stephen Hutchings 2012
   Author:    Stephen Hutchings
   License:   SIL (http://scripts.sil.org/OFL)
   Homepage:  http://typicons.com/
## Entypo
   Copyright (C) 2012 by Daniel Bruce
   Author:    Daniel Bruce
   License:   SIL (http://scripts.sil.org/OFL)
   Homepage:  http://www.entypo.com
## Iconic
   Copyright (C) 2012 by P.J. Onori
   Author:    P.J. Onori
   License:   SIL (http://scripts.sil.org/OFL)
   Homepage:  http://somerandomdude.com/work/iconic/
