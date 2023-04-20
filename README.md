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
handler.simplify(v) // simplifies the object
handler.reconstitute(v) // reconstitutes the object from simplified object
handler.compare(a,b) // compares two objects to determine whether something has changed when replacing
handler.watchMethods() // returns a list of method names to watch and react to
```

There are four methods on the reactive object itself:

```javascript
rObj.watch(path, callback, ...extra) // extra is optional
rObj.unwatch(path, callback) // both are optional allowing to clear all watchers if nothing is passed
rObj.backup(key, storageObject=localStorage) // when nothing is passed the backup returns a flattened JSON array. When only key is passed it synchronizes to that key in localStorage. When a storage object is passed it synchronizes to the specified key using the storage setItem() and getItem() methods allowing for both transient and In all cases backup checkpoints to an internal backup.
rObj.restore(JSONArray) // When nothing is passed it restores from the internal checkpoint. 
``

Callback have the following signatures:

```javascript
callback(newValue, OldValue, path, ...extra) // Direct and Wildcard callbacks use this signature
callback(returnValue, callArgs, path, ...extra) // Function callbacks replace new and old with return value and call arguments.
```

All reactive objects trigger one another. Reaction order is longest to shortest and then alphabetical so the order is somewhat deterministic. However, since objects could be mounted at different points in the chain there is no guarantee that one reaction won't happen before another for different paths.

Circular references ARE allowed. However, the deeper child paths will never fire to avoid triggering an endless loop.
