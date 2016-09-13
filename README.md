
Page Size Inspector
===================

Page Size Inspector is a Chrome extension that reports page size, cache usage,
network requests, load time in a convenient way.

Install from [Chrome Store](https://chrome.google.com/webstore/detail/oepnndnpjiahgkljgbohnnccmokgcoln)

![Screenshot](img/shot1.png)


Build steps
-----------

A home made simple python make script takes care of 3 tasks.

To make a release, a zip package:

    python make.py release

To compile Monkberry templates:

    python make.py compile

To test the popup locally with test data:

    python make.py www


Other extensions
----------------

I also have two other open-source Chrome extensions
[Quick source viewer](https://github.com/tomimick/chrome-ext-view-src) and
[Save CSS](https://github.com/tomimick/chrome-ext-save-css).

