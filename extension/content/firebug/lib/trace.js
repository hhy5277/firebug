/* See license.txt for terms of usage */

define([], function() {

// ********************************************************************************************* //
// Constants

const Cu = Components.utils;

var fbTraceScope = {};
Cu["import"]("resource://firebug/fbtrace.js", fbTraceScope);

var prefLoaderScope = {};
Cu["import"]("resource://firebug/prefLoader.js", prefLoaderScope);

//xxxHonza: duplicated from modules/firebug-trace-service.js
var TraceAPI = ["dump", "sysout", "setScope", "matchesNode", "time", "timeEnd"];

// ********************************************************************************************* //
// Wrapper

/**
 * Wraps tracer for given option. Logs made through the wrapper will automatically
 * be checked against the option and only displayed if the option is true.
 * If FBTrace console isn't installed all options are false and there is no
 * additional performance penalty.
 */
function TraceWrapper(tracer, option)
{
    function createMethodWrapper(method)
    {
        return function()
        {
            // Check the option before the log is passed to the tracing console.
            if (tracer[option])
                tracer[method].apply(tracer, arguments);
        }
    }

    for (var i=0; i<TraceAPI.length; i++)
    {
        var method = TraceAPI[i];
        this[method] = createMethodWrapper(method);
    }
}

// ********************************************************************************************* //

var tracer = fbTraceScope.FBTrace;

/**
 * Support for scoped logging.
 * 
 * // The log will be displayed only if DBG_MYMODULE option is on. 'DBG_MYMODULE' preference
 * // will be automatically created and appear in the FBTrace console (after restart).
 * FBTrace = FBTrace.to("DBG_MYMODULE");
 * FBTrace.sysout("mymodule.initialiaze");
 */
tracer.to = function(option)
{
    // Automatically create corresponding DBG_ + <option> preference so, it appears
    // in the FBTrace Console window and can be checked on/off
    var value = prefLoaderScope.PrefLoader.getPref(option);
    if (typeof(value) == "undefined")
        prefLoaderScope.PrefLoader.setPref(option, false);

    return new TraceWrapper(this, option);
}

return tracer;

// ********************************************************************************************* //
});
