
// Page size inspector - background page
// by tomi.mickelsson@iki.fi


// current tab being inspected
var gtabid = 0;

var is_loading = false;
var is_cache_disabled = false;

// map of tabid -> requests
var netList = {};

// list of requestIds that were cached
var cachedList = {};

//--------------------------------------------------------------------------
// chrome events

// tab changed
chrome.tabs.onActivated.addListener(function(info) {
    // seems chrome.tabs.get always causes exception...
    return;
    chrome.tabs.get(info.tabId, function(tab) {
        tab_updated(tab.id);
    });
});

// tab deleted
chrome.tabs.onRemoved.addListener(function(tabid){
    clear_tab_data(tabid);
});

// page load start
// https://developer.chrome.com/extensions/webNavigation
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {

    if (details.frameId === 0 && details.tabId == gtabid) {
        // main frame loaded
        deb("onStart");

        is_loading = true;

        clear_tab_data(details.tabId);

        // remember time
        var t = details.timeStamp;
        netList[details.tabId+"t0"] = t;
    }
});

// page completed
chrome.webNavigation.onCompleted.addListener(function(details) {

    if (details.frameId === 0 && details.tabId == gtabid) {
        deb("onCompleted");

        is_loading = false;

        chrome.runtime.sendMessage({load_completed: 1});

        // remember time
        var t = details.timeStamp;
        netList[details.tabId+"t1"] = t;

    }
});


//--------------------------------------------------------------------------
// methods

function update_badge(tabid) {
    var is_active = (gtabid !== 0 && (gtabid == tabid));

    var count = get_requests_count(tabid);
    var txt = is_active ? ""+count : "";

    chrome.browserAction.setBadgeText({"text":txt});

    var inred = count >= 100;
    var col = inred ? "#a00" : "#1656E4";
    chrome.browserAction.setBadgeBackgroundColor({"color":col});

    var iconname = is_active ? "icon.png" : "icon0.png";
    chrome.browserAction.setIcon({path:iconname});
}

function tab_updated(tabid) {
    deb('active tab: '+tabid);

    update_badge(tabid);
}

// remove all network requests of this tab
function clear_tab_data(tabid) {
//    deb("cleared "+tabid);

    delete netList[tabid+"list"];
    delete netList[tabid];

    cachedList = {};
}

// add or get a single request item from list
function get_item(tabid, reqid) {
    if (!netList[tabid])
        netList[tabid] = {};
    if (!netList[tabid+"list"])
        netList[tabid+"list"] = [];

    var obj = netList[tabid][reqid];
    if (!obj) {
        obj = {};
        netList[tabid][reqid] = obj;
    }

    return obj;
}

// add a request to the list
function add_file(tabid, reqid, url, code, from_cache, type) {

    if (url && url.startsWith("chrome-extension:"))
        return;

    var urlpart = url.split("/").pop();

    // is request cached even though from_cache = false!?
    if (cachedList[reqid])
        from_cache = true;

//    deb("add", reqid, urlpart, "cached:", from_cache);

    var obj = get_item(tabid, reqid);

    obj["url"] = url;
    obj["code"] = code;
    obj["type"] = type;
    obj["req"] = reqid;
    obj["cached"] = from_cache;
    obj["size"] = 0;

    // add to request list
    netList[tabid+"list"].push(obj);

    chrome.runtime.sendMessage({file: url}, function(response) {
    });

}

// set size of the item
function set_file_size(tabid, reqid, size, is_chunk) {
    size = isNaN(size) ? 0 : size || 0;

    var obj = get_item(tabid, reqid);

//    var isdoub = (is_chunk && obj.size);

    if (size)
        obj.size = size + (is_chunk? (obj.size || 0) : 0);

//    if (isdoub)
//        deb("  double ", reqid, size, obj.size);
//    else
//        deb("  single ", reqid, size, obj.size);
}

// provide list of network requests
function get_tab_network_requests(tabid) {
    tabid = parseInt(tabid);
    return netList[tabid+"list"];
}
function get_tab_load_time(tabid) {
    var t0 = netList[tabid+"t0"];
    var t1 = netList[tabid+"t1"];
    return t1-t0;
}

// count non-cached network request
function get_requests_count(tabid) {
    tabid = parseInt(tabid);

    var c = 0;
    var list = netList[tabid+"list"];
    if (list && list.length) {
        for (const obj of list) {
            if (!obj.cached)
                c++;
        }
    }

    return c;
}

//--------------------------------------------------------------------------
// debugger logic

chrome.debugger.onDetach.addListener(onDetachDebugger);
chrome.debugger.onEvent.addListener(onNetworkEvent);

function startDebugger(tabid) {
    deb("startDebugger");

    if (gtabid) {
        // first detach from current tab
        stopDebugger(gtabid);
    }

    var version = "1.0";
    var cb = onAttachDebugger.bind(null, tabid);

    chrome.debugger.attach({"tabId":tabid}, version, cb);

    if (chrome.runtime.lastError)
        return false;

    chrome.debugger.sendCommand({tabId: tabid}, "Network.enable");
    return true;
}

function stopDebugger(tabid) {
    deb("stopDebugger");

    gtabid = 0;
    is_cache_disabled = false;

    // does not call onDetachDebugger!
    chrome.debugger.detach({tabId:tabid});

    update_badge(tabid);
}

function setCache(tabid, state) {
    deb("setCache ", state);

//    if (!is_debugger_on)
//        startDebugger(tabid);

    is_cache_disabled = state;

    chrome.debugger.sendCommand(
        { tabId: tabid },
        "Network.setCacheDisabled", { "cacheDisabled": state });
}

function reload(tabid) {
    deb("reload");

    chrome.debugger.sendCommand(
        { tabId: tabid },
        "Page.reload", { "ignoreCache": false });
}
function navigate(tabid, url) {
    deb("navigate");

    chrome.debugger.sendCommand(
        { tabId: tabid },
        "Page.navigate", { "url": url });
}

function getState(tabid) {
    var r = {"is_debugger_on": gtabid==tabid,
            "is_cache_disabled":is_cache_disabled,
            "is_loading":is_loading};
//    deb("state", tabid, gtabid, r);
    return r;
}

function onAttachDebugger(tabid) {

    if (chrome.runtime.lastError) {
        var msg = chrome.runtime.lastError.message;
//        err(msg);
        chrome.runtime.sendMessage({"attach_error":msg});
    } else {
        deb( "onAttach ok");

        gtabid = tabid;
    }
}
function onDetachDebugger(source, reason) {
    err("onDetach");

    is_cache_disabled = false;

    // ask to refresh popup
    chrome.runtime.sendMessage({load_completed: 1});

    gtabid = 0;
    update_badge(0); // can be zero
}

//https://chromedevtools.github.io/debugger-protocol-viewer/tot/Network/

function onNetworkEvent(debuggeeId, message, params) {

    var tabid = debuggeeId.tabId;

    if (message == "Network.responseReceived") {

        // remember request id + url
        var resp = params.response;
        var reqid = params.requestId;
        // resp.encodedDataLength -1!

        // resp.fromDiskCache may be false even though came from cache!
        // A Chrome bug? Double check with Network.requestServedFromCache
        add_file(tabid, reqid, resp.url, resp.status, resp.fromDiskCache,
            params.type);

//        console.debug("responseReceived", resp.url, resp.fromDiskCache,
//            resp.encodedDataLength);

        /*
        if (resp.fromDiskCache) {
            chrome.debugger.sendCommand({tabId: tabid},
                "Network.getResponseBody", {"requestId": reqid},
                function(reply) {
                    if (!reply)
                        return;
                var size = reply.body? reply.body.length : 0;
                if (!size)
                    size = reply.base64Encoded? reply.base64Encoded.length : 0;

                set_file_size(tabid, reqid, size);
                console.debug("  BODY", size);
            });
        }*/

    } else if (message == "Network.requestServedFromCache") {
        // fired if request ended up loading from cache.
        //deb("fromcache" + params.requestId);

        cachedList[params.requestId] = 1;

    } else if (message == "Network.dataReceived") {
//        console.debug("data", params);

        // a chunk received!
        var reqid = params.requestId
        var size = params.dataLength; // is uncompressed!
//        var size = params.encodedDataLength; // zero!
        set_file_size(tabid, reqid, size, 1);
        update_badge(tabid);

    } else if (message == "Network.loadingFinished") {

        var reqid = params.requestId
        var size = params.encodedDataLength;
        set_file_size(tabid, reqid, size);

        update_badge(tabid);
    }
//    else {
//        deb(message, params);
//    }

}

function err(msg) {
    console.debug("ERR "+ msg);
}
deb = console.debug;

deb('inspector loaded');

