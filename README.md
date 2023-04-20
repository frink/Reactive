# Reactive Proxy Spec

Reactive objects is a simple way to bring reactivity to any JavaScript application. It requires ES6 features. This presents as a polyfill and reference implementation for eventual inclusion into ES7. Proposals for ECMA and W3C are in draft and expected to be referenced here once submitted.

Instantiation is simple:

```javascript
robj = new Reactive(obj);
```

There are two static methods on the class:

```javascript
Reactive.trigger(rObj, path) // triggers a reaction at the specified path
Reactive.register(class, handler) // registers new reactive handlers for a given class
```

Three path types are allowed for triggering:

- Direct paths "obj.child.name"
- Wildcard paths "obj.any_child.*"
- Function paths "map.set.call()"

Class handlers have for methods which are all optional:

```javascript
// simplifies the object to basic JSON(Number, String, Array, Object and Null)
handler.simplify(v)
// reconstitutes the object from simplified object
handler.reconstitute(v) 
// compares two objects to determine whether something has changed (used to determine reactivity)
handler.compare(a,b) 
// returns an array of method names to watch and react to changes
handler.watchMethods()
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
rObj.restore(JSONArray) // Argument is optional
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
