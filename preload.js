
console.log('LOADING PRELOAD SCRIPT')

var globalid = 1;
function traceMethodCalls(obj, id=0) {
    return new Proxy(obj, {
        get: function (target, propKey, receiver) {
            //I only want to intercept method calls, not property access
            var propValue = target[propKey];
            // console.log(`window#${id}.${propKey}(${[].slice.apply(arguments)})`);
            if (typeof propValue != "function") {
                console.log(`window#${id}.${propKey}`);
                return propValue;
            }
            else {
                return function () {
                    console.log(`window#${id}.${propKey}(${[].slice.apply(arguments)})`);
                    // return propValue.apply(this, arguments);
                    return propValue.apply(target, arguments);
                }
            }
        }
    });
}


let oldWindowOpen = window.open;
window.open = function (...args) {
    console.log('window.open', ...args);
    return traceMethodCalls(oldWindowOpen.apply(window, args), globalid++)
}

window.addEventListener('message', (event) => {
    console.log(event);
},true)

function augment(obj, withFn) {
    var name, fn;
    for (name in obj) {
        fn = obj[name];
        if (typeof fn === 'function') {
            obj[name] = (function(name, fn) {
                var args = arguments;
                return function() {
                    withFn.apply(this, args);
                    return fn.apply(this, arguments);
                }
            })(name, fn);
        }
    }
}

augment(window, function(name, fn) {
    console.log("calling " + name);
});



let windowOpener = window.opener;
if(window.opener) window.opener = traceMethodCalls(windowOpener, 'opener');
