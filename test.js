
// only used during tests

function test_data() {
    deb("testing");

    var o = {"url":"https://yogaia.com/rec","code":200,"type":"Document",
        "cached":0, "size":45022};
    var o2 = {"url":"https://yogaia.com/moobar/bar_foo/jaska/main.css","code":400,"type":"Stylesheet",
        "cached":0, "size":110933 };
    var o3 = {"url":"https://abc.com/lots/ofsmallfiles/here/extra.css","code":200,"type":"Stylesheet",
        "cached":1, "size":459};

    var o4 = {"url":"http://yle.fi/uutiset/","code":302,
        "type":"Manifest",
        "cached":1, "size":90};

    var o5 = {"url":"https://jquery.com/jquery.min.js","code":200,"type":"Script",
        "cached":1, "size":45459};
    var o6 = {"url":"data:werewrwe32423wersfwerewr","code":200,"type":"Image",
        "cached":0, "size":13099};
    var o7 = {"url":"https://google.com/long-folder-name/fonts-generated-abcdefg-223457322-and-name-stillcontinues.css","code":200,"type":"Stylesheet",
        "cached":0, "size":90555};
    var o8 = {"url":"https://yogaia.com","code":200,"type":"Document",
        "cached":0, "size":560};
    var o9 = {"url":"https://yogaia.com/","code":200,"type":"Document",
        "cached":0, "size":560};


    var state = {is_debugger_on:1, is_cache_disabled:1};
    build_popup([o, o2, o3, o4, o5, o6, o7, o8, o9], "http://yogaia.com", state);
}

