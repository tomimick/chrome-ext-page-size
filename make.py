#!/usr/bin/python
# -*- coding: utf-8 -*-

# make.py: simple project make/util tool
#
# Author: Tomi.Mickelsson@iki.fi

import sys
import tempfile
import shutil
import os


def build_release():
    print "build_release"

    # files in release
    FILES = ["bg.js", "util.js", "main.js", "manifest.json", "popup.html",
            "popup.css", "build/templates.js", "ext/monkberry.min.js",
            "icon.png", "icon0.png", "icon128f.png"]

    # temp dir
    dir = tempfile.mkdtemp(suffix="")
    print "created", dir

    # copy files
    os.mkdir(dir+"/build")
    os.mkdir(dir+"/ext")
    for x in FILES:
        shutil.copyfile(x, dir+"/"+x)

    # make zip
    print "compressing files"
    for i, x in enumerate(os.listdir(dir)):
        print "  ", i+1, x

    shutil.make_archive("./release", "zip", dir)
    print "release.zip created"

    print "deleting", dir
    shutil.rmtree(dir)


def compile_templates():
    print "compile_templates",

    os.system("monkberry templates/*.monk --output build/templates.js")


def run_wwwserver():
    import SimpleHTTPServer
    import SocketServer

    PORT = 8100
    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = SocketServer.TCPServer(("", PORT), Handler)
    print "Serving at port", PORT
    httpd.serve_forever()


def main():
    cmd = sys.argv[1]

    if cmd == "release":
        build_release()
    elif cmd == "compile":
        compile_templates()
    elif cmd == "www":
        run_wwwserver()
    else:
        print "error!"

main()

