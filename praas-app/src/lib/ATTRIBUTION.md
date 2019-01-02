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
- is it used as a dependency listed in package.json or imported in source form?
- if imported in source form, is it used in its original form or modified?
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

NOTE: if you find any dependency (that was directly utilized via package.json)
or in source form, please add the missing dependency here and send a PR.

NOTE: you should list dependencies and code that gets shipped; which
excludes having the need to list out tools such as webpack, gulp, etc.; unless
some part of the code base as described in the introduction got used.

Attributions
============

Classcat
--------
- package-name: classcat
- source-origin: https://github.com/jorgebucaran/classcat
- copyright-owner: Jorge Bucaran
- used-how: in source form, renamed function name to cx
- source-modified: yes
- source-license: MIT
