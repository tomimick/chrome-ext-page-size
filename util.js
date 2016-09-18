
// utility functions
// by tomi.mickelsson@iki.fi


deb = console.debug;

// get elem shortcut
function getelem(id) {
    return document.getElementById(id);
}

//http://stackoverflow.com/questions/2901102/how-to-print-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// copy text to clipboard
function copy2clipboard(txt) {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = txt;
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
}

// removes http/s prefixes
function remove_url_prefix(url) {
    if (!url)
        return url;
    if (url.startsWith("http://"))
        url = url.substr(7);
    else if (url.startsWith("https://"))
        url = url.substr(8);
    return url;
}


// truncates and emphasizes the file name part of the url
function sanitize_url(url, maxlen, no_bold) {
    const MAX_LEN = maxlen || 50;

    if (!url)
        return url;

    if (url.startsWith("data:"))
        return url.substr(0, MAX_LEN);

    url = remove_url_prefix(url);

    var i1 = url.indexOf("/");
    if (i1 < 0 || i1 == url.length)
        return url.substr(0, MAX_LEN); // 1 slash at end or no slash

    var i2 = url.lastIndexOf("/");
    var part1 = url.substr(0, i1+1); // domain
    var part2 = url.substring(i1+1, i2+1); // middle
    var fname = url.substr(i2+1).slice(-(MAX_LEN-10)); // file name
    var rest = MAX_LEN - part1.length - fname.length;
    if (i1 == i2)
        part2 = "";
    else if (rest <= 0)
        part2 = ".../";
    else if (part2.length <= rest)
        ;
    else
        part2 = part2.substr(0, rest) + ".../";

    if (no_bold)
        return part1 + part2 + fname;
    else
        return part1 + part2 + "<b>" + fname + "</b>";
}

// returns next siblings of dom elem that have classname
function get_siblings(elem, classname) {
    var siblings = [];
    while (elem = elem.nextSibling) {
        if (elem && elem.classList && elem.classList.contains(classname))
            siblings.push(elem);
        else
            break;
    }
    return siblings;
}

// checks whether this dom elem or its parents have a class name
// if yes, returns that elem
function is_child_of(elem, parent_class) {
    while (true) {
        if (!elem)
            return false;

        if (elem.classList && elem.classList.contains(parent_class))
            return elem;

        elem = elem.parentNode;
    }
}

// http://stackoverflow.com/questions/2686855/is-there-a-javascript-function-that-can-pad-a-string-to-get-to-a-determined-leng
function pad(pad, str, padLeft) {
    if (typeof str === 'undefined')
        return pad;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}

