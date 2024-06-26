# Reactive Proxies

Reactive Proxies is a simple way to bring reactivity to any JavaScript application. It requires ES6 features.

This is a polyfill and reference implementation for proposal of eventual inclusion in Javascript Proper.

Proposal for ECMA is in draft and expected to be referenced here once submitted.

Instantiation is simple:

```javascript
robj = new Reactive(obj);
```

There are four static methods on the class:

```javascript
// triggers a reaction at the specified path
Reactive.trigger(rObj, path)
// registers new reactive handlers for a given class
Reactive.register(class, handler)
// compare two reactive objects
Reactive.compare(rObj1, rObj2)
// clone an existing reactive object
Reactive.clone(rObj)
```

Three path types are allowed for triggering:

```javascript
// Direct paths
rObj.watch("obj.child.name",callback)
// Wildcard paths
rObj.watch("obj.any_child.*",callback)
// Function paths
rObj("map.set()",callback)
```

Class handlers have for methods which are all optional:

```javascript
// simplifies the object to basic JSON(Number, String, Array, Object and Null)
handler.backup(v)
// reconstitutes the object from simplified object
handler.restore(v) 
// update one object to be a copy of the other
handler.update(a,b) 
// an array of method names to watch and react to changes
handler,methods
```

There are four methods on the reactive object itself:

```javascript
rObj.watch(path, callback, ...extra) // extra is optional
rObj.unwatch(path, callback) // both are optional
/**
 * When only path is given the unwatch deletes all reactions for that path.
 * When the callback is also given the unwatch is only applied for that single
 * reaction. When no arguments are given the unwatch clears ALL reactions.
 */
rObj.backup(key, storageObject=localStorage) //both key and storageObject are optional
/**
 * When nothing is passed the backup returns a flattened JSON Array
 * repensenting the Reactive Object. When only key is passed it synchronizes
 * to that key in localStorage. When a storage object is passed it
 * synchronizes to the specified key using the storage setItem() and
 * getItem() methods allowing for both transient and long term storage.
 * In all cases backup saves a checkpoints to an internal backup.
 */
rObj.reset(JSONArray) // Argument is optional
/**
 * When nothing is passed it restores from the internal checkpoint.
 * We use flattened JSON to allow circular references and complex
 * objects to be represented by JSON.
 */
```

Callback have the following signatures:

```javascript
// direct and wildcard callbacks use this signature
callback(newValue, OldValue, path, ...extra)
// function callbacks replace new and old with return value and call arguments.
callback(returnValue, callArgs, path, ...extra)
```

Caveats and things to note:

- All reactive objects trigger each another.
- Reaction order is longest to shortest and then alphabetical so the order is somewhat deterministic.
- Circular references ARE allowed but the deeper child paths will never fire to avoid triggering an endless loop.
