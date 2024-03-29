//Reactive Proxy
((R,e,a,c,t,i,v,E)=>(
  //R=reactive class
  //e=encode string
  //a=activate to object
  //c=collate names
  //t=traverse map
  //i=instace check
  //v=values map
  //E=encapsulator

  //reactive class
  R=class Reactive{
    //actions map
    #a=new Map;
    //backup string
    #b=[{}];
    //core object
    #c;
    //defered object
    #d;

    //constructor(object)
    constructor(o={}){
        //o=object

        //return proxied
        return (_=>(
          //setup deferred object
          _.#d=new WeakRef(_.#a),
          //setup object
          _.reset(o),
          //setup proxy
          new Proxy(
            _,
            //setup root handler
            {
              //if requesting function
              get:(o,n)=>_[n]?.call
                //return bound funtion
                ?_[n].bind(_)
                //otherwise return proxied
                :_.#c[n],
              //if setting pass through
              set:(o,n,e)=>_.#c[n]=e,
              //if deleting pass through
              deleteProperty:(o,n)=>delete _.#c[n]
            //done with root handler
            }
          //done with proxy
          )
        //populate closure with this
        ))(this)
    //done with constructor
    }

    //reset(object)
    reset(o){
      //o=object

      //internal shortener
      ((_,e)=>(
        //get entity
        e=E.raw(_.#c),
        //remove old map
        E.map(e||o).delete(_.#d),
        //release children
        E.rel(e,'',e),
        //must be a raw object
        o=E.raw(o||e),
        //assign restoration
        _.#c=E.as(
          //current object
          e,
          //if object is passed
          i(o)
            //use as is
            ?o
            //otherwise assemble the object
            :a(o||_.#b)
        ),
        //get new value
        o=E.raw(_.#c),
        //setup object
        E.map(o,_.#d).set(''),
        //register children
        E.reg(o),
        //checkpoint backup
        _.backup()
      //populate closure with this
      ))(this)
    //done with reset method
    }

    //backup(key, storage)
    backup(k,s=localStorage){
      //k=key
      //s=storage object

      //internal shortners
      const _=this;

      //save backup of object
      if(!k)return _.#b=e(_.#c);

      //make sure that storage exists
      if(!i(s,Storage))throw TypeError('Invalid storage object');
      //make sure key exists
      if(!k.trim)throw TypeError('Invalid storage key');

      //load data from backup to responsive
      _.#c=E.as(
        //assign to live data
        _.#c,
        //from the backup
        a(s.getItem(k)||_.#b)
      );
      //setup automatic saving to storage
      _.watch('*',n=>s.setItem(k,e(_.#c)))
    //done with backup method
    }

    //watch(path,callback,arguments)
    watch(p,c,...a){
      //p=path
      //c=callback
      //a=arguments

      //console.log('WATCH',p,c,...a);

      //register action for path
      return !!t(this.#a,p).set(c,a)
    //done with watch method
    }

    //unwatch(path,callback)
    unwatch(p,c){
      //p=path
      //c=callback

      //console.log('UNWATCH',p,c);

      //reduce action to boolean
      return !!(
        //do we have a path
        p
          //find it or fake it
          ?this.#a.get(p)||new Map
          //or use everything
          :(c=0,this.#a)
      //find action
      )[
        //do we have a callback
        c
          //delete it
          ?'delete'
          //oterwise clear all
          :'clear'
      //pass callback
      ](c)
    //done with unwatch method
    }

    //get value of Reactive
    valueOf(){
      return this.#c.valueOf()
    }

    //create a new map of the current reactive obj
    static clone(r){
      if(!i(r,R))throw TypeError('Invalid '+R.name);

      //generate a new Reactive
      return new R(a(e(r.valueOf())))
    //done with clone method
    }

    //register object handler
    static register(o,h){
      v.set(o,h)
    //done with register handler
    }

    //trigger object with path
    static trigger(o,p='*'){
      let v,
      //list of names for path
      l=p.split('.'),
      //final name
      n=l.pop(),
      //gathered reactions
      g=new Map;

      //check for proper
      if(!i(o))throw TypeError('First argument not an object');

      //object from path
      o=l.reduce(
        //traverse names
        (o,r)=>o?.[r],
        //start with raw
        E.raw(o)
      );
      //values if name is star
      v=n=='*'
        //value is object
        ?o
        //otherwise value is one deeper
        :o?.[n];

      //enqueue reactions
      E.enq(n.endsWith('()')?[E.U,[]]:v,n,o,g);
      //run reactions
      return E.run(g)
    //done with trigger method
    }

    //compare two obects fot changes
    static compare(a,b){
      //run internal compare
      return E.is(E.raw(a),E.raw(b))
    //done with compare function
    }
  //done with class
  },
  //encode to JSON Array string
  e=$=>(
    //internal function
    (j,s,r,c)=>(
      //j=jump source map
      //s=substitution map
      //r=return array
      //c=collector function

      //define collector function
      c=v=>(
        //v=value to collect

        //internal zap function
        z=>
          //z=zap destination

          //if jump map has the value
          j.has(v)
            //get the value assignment
            ?j.get(v)
            //otherwise this is a new jump
            :(
              //set the jump reference
              j.set(
                //from value
                v,
                //push return value onto return array
                r.push(
                  //if value is a number
                  typeof v=='number'
                    //convert to string (especially for Infinity, Epsilon, NaN)
                    ?{'#':v+''}
                    //else if its an object
                    :i(v)
                      //push zap object (either an array or an object)
                      ?z
                      //else if undefined
                      :v==r.U
                        //reference undefined as -1
                        ?-1
                        //otherwise return value as is
                        :v
                //push returns length so we get the key by subtracting 1
                )-1
              //complete the j.set to add a new jump refference
              ),
              //if value is an object
              i(v)&&(
                //loop through possible parents
                E.on(
                  s,
                  //check if inherited from parent
                  (r,p)=>r||=i(v,p)
                    //if so set name
                    ?z[p.name]=c(s.get(p)(v))
                    //otherwise use return
                    :r,
                  //start as zero
                  0
                //if no parent found loop keys
                )||E.on(
                  v,
                  //for each zap
                  k=>z[
                    //if it's an array
                    i(v,Array)
                      //a key is the the key
                      ?k
                      //otherwise collect key
                      :c(k)
                    //set collected value
                    ]=c(v[k])
                //done looping keys
                )
            //done processing object
            ),
              //return jump reference
              j.get(v)
            //done registering value
            )
      //call internal zap function
      )(
        //if value is an array
        i(v,Array)
          //zap is array
          ?[]
          //otherwise zap is object
          :{}
      //done defining collector function
      ),
      //now call collector function on raw object
      c(E.raw($)),
      //finally strigify the result to an array
      JSON.stringify(r)
    //Done defining internal function
    )
  //call internal function
  )(
    //jump source
    new Map,
    //substitution map
    new Map(
      //loop through values map
      E.on(
        //see values map below
        v,
        //populate our map with backup functions
        k=>[k,v.get(k).backup]
      //remove anthing that doesn't have a backup function
      ).filter(m=>m[1])
      //reverse to create correct order of president
      .reverse()
    //set substitution map
    ),
    //return array (always start with a blank array)
    []
    //run internal function to return encoded result
  ),
  //assemble to object
  a=$=>((s,r,c)=>(
    //s=substitution map
    //r=reference array
    //c=construct function

    //construct object
    c=v=>(
      //if it's a string
      typeof v=='string'
        //don't bother
        ?v
        //if it's a number
        :typeof v=='number'
          //get referenced value
          ?r[v]
          //loop through the keys
          :E.on(
            //for value
            v,
            //object key is number
            (v,k)=>parseInt(k)>=0
              //then process object
              ?(
                //get value sub
                v[
                  //if array
                  i(v,Array)
                    //key is a number
                    ?k
                    //otherwise key is a retrurn value
                    :r[k]
                //set return value
                ]=r[v[k]],
                //if not a map delete the key
                !i(v,Array)&&(delete v[k]),
                //return object
                v
              //done processing object
              )
              //otherwise get the transform function
              :(
                //get fromJSON function
                s.get(k)||(_=>v)
              //process the collected objecgt
              )(c(v[k])),
              //use value
              v
          //done looping through keys
          )
    //done constructing object
    ),
    //loop referenced objects
    (l=>{
      //work backwards and replace
      while(l--)r[l]=c(r[l])
    //start from length of reference array
    })(r.length),
    //return the first reference
    r[0]
  //populate substitutions and reference array
  ))(
    //substitution map
    new Map([['#',parseInt]].concat(
      E.on(v,k=>[k.name,v.get(k).restore||(_=>_)])
    )),
    //reference array
    JSON.parse($)
  //done activating object
  ),
  //collate names
  c=(l,n)=>l&&n.length?l+'.'+n:n,
  //traverse map
  t=(t,...m)=>m.reduce(
    //i=initial map
    //m=map indices

    //set a new map if needed
    (o,n)=>o.get(n)||o.set(n,new Map).get(n),
    //start with initial map
    t
  //return traversed map
  ),
  //instance check
  i=(a,b=Object)=>a instanceof b,
  //values map
  v=((b,u,r,m)=>new Map([
    //b=backup
    //u=update
    //r=restore
    //m=methods
    
    //Object
    [Object,{
      [u]:(a,b)=>(
        //delete obsolete keys
        E.on(a,k=>b[k]===E.U&&delete a[k]),
        //if the key exists
        E.on(b,k=>a[k]=E.up(a[k],b[k])),
        //return original object
        a
      )
    }],
    //Array
    [Array,{
      [m]:['push','pop','shift','unshift','splice','concat','fill','sort']
    }],
    //Regular Expressions
    [RegExp,{
      [b]:v=>[v.source,v.flags],
      [r]:v=>new RegExp(...v)
    }],
    //Dates
    [Date,{
      [b]:v=>v.toJSON(),
      [u]:(a,b)=>a.setTime(b.getTime()),
      [r]:v=>new Date(v),
      [m]:Object.getOwnPropertyNames(Date.prototype).filter(k=>k.startsWith('set'))
    }],
    //Sets
    [Set,{
      [b]:v=>[...v.values()],
      [u]:(a,b,c=new Map,d)=>(
        //fill replacements map
        b.forEach(v=>c.set(e(v),v)),
        //loop through current stuff
        a.forEach(v=>
          //check if you have this one
          c.has(d=e(v))
            //if it's there don't need it
            ?c.delete(d)
            //if it's gone delete
            :a.delete(v)
        ),
        //add missing assignments
        c.forEach(v=>a.add(v)),
        //return original set
        a
      ),
      [r]:v=>new Set([...v]),
      [m]:['add','delete','clear']
    }],
    //Maps
    [Map,{
      [b]:v=>[...v.entries()],
      [u]:(a,b,c=new Map,d)=>(
        //fill replacements map
        b.forEach((v,k)=>c.set(e(k),[k,v])),
        //loop through current stuff
        a.forEach((v,k)=>(
          //check if you have this one
          c.has(d=e(k))
            //if it's different assign new values
            ?a.set(k,E.up(v,c.get(d)[1]))&&c.delete(d)
            //if it's gone delete
            :a.delete(k)
        )),
        //add missing assignments
        c.forEach(v=>a.set(...v)),
        //return original map
        a
      ),
      [r]:v=>new Map(v),
      [m]:['set','delete','clear']
    }]
  //done with value map
  ]))('backup','update','restore','methods'),
  //encapsulator functions
  E={
    //prototype is Reactive.prototype
    getPrototypeOf:_=>R.prototype,
    //trap getter
    get:(o,n)=>(
      //if looking for raw
      n==E.sym
        //return object
        ?o
        //of object
        :i(
          //if we don't have a name
          o=n===E.U
            //test parent
            ?o
            //otherwise use child
            :o[n]
        //regardless test if object
        )
          //if true wrap with proxy
          ?new Proxy(o,E)
          //otherwise no need to wrap
          :o
    //done with gettter trap
    ),
    //trap setter
    set:(o,n,e,s=1,g=new Map,p,u)=>(
      //o=object
      //n=name
      //e=entity
      //s=save value
      //g=gathered reactions
      //p=parent
      //u=unit name

      //set unit name
      u=n.split('.').pop(),

      //entity could be an existing Reactive
      e=E.raw(e),
      //set the name and heldover parents
      p??=o,
      //object is always an object
      o??={},

      //process if changed
      !E.is(o[u],e)&&(
        //enqueue reactions
        E.enq(o[u],n,p,g),
        //process deletions
        E.on(o[u],k=>e?.[k]===E.U&&E.set(o[u],c(n,k),E.U,0,g,p)),
        //process additions and changes
        E.on(e,k=>E.set(o[u],c(n,k),e[k],0,g,p)),
        //process changes
        s&&(
          //release old values
          E.rel(o[u],n,o),
          //register new values
          E.reg(e,u,o),
          //is value blank
          e===E.U
            //delete it
            ?delete o[u]
            //otherwise set it
            :o[u]=e,
          //run reactions
          E.run(g),
          //return true
          !0
        //done activating
        )
      //done processing
      ),
      //always return true
      1
    //done with setter trap
    ),
    //deleteProperty is just setting to undefined
    deleteProperty:(o,n)=>E.set(o,n,E.U),
    //trap execution
    apply:(f,o,r,g=new Map,s=new Set,t,h)=>(
      //f=function
      //o=object
      //r=result
      //g=gathered reactions
      //s=sanity check
      //t=trigger reactions
      //h=held arguments

      //held arguments
      h=a(e(r)),
      //object target must be raw
      o=E.raw(o),
      //check if we trigger
      t=E.in(
        //search for handler
        E.on(
          //values map
          v,
          //loop through values to get methods
          (a,r)=>a||i(o,r)&&v.get(r).methods,
          //
          0
        )||[],
        //search for name in watched
        f.name
      ),
      //enqueue reaction parent if watch method
      t&&E.enq(o,'*',o,g,s),
      //run function
      r=f.apply(o,r),
      //enqueues reaction if watched method
      t&&E.enq([r,h],f.name+'()',o,g,s),
      //if we are watching run reactions
      t&&E.run(g),
      //return result
      r
    //done with appy trap
    ),

    //map objects to one universal map of objects
    map:(_=>(...a)=>t(_,...a))(new WeakMap),
    //register objects to track
    reg:(o,n='',e,s=new Set)=>(
      //o=object
      //n=name
      //e=extends parent
      //s=sanity check

      //only register object if sain
      i(o)&&!s.has(o)&&(
        //add object to sanity check
        s.add(o),
        //loop action maps
        E.of(
          //traverse to get map
          E.map(e||o),
          //loop object paths
          (a,m)=>E.of(
            a,
            //register each path
            (i,p)=>E.map(o,m).set(c(p,n.split('.').pop()),e)
          //done looping paths
          )
        //done looping maps
        ),
        //now register children
        E.on(o,k=>E.reg(o[k],c(n,k),o,s))
      //done with registration
      )
    //done with registration
    ), 
    //release objects
    rel:(o,n='',e,s=new Set)=>(
      //o=object
      //n=name
      //e=extends parent

      //only release object not previously touched
      i(o)&&!s.has(o)&&(
        //add object
        s.add(o),
        //loop action maps
        E.of(
          //get map for object
          E.map(e),
          //loop mapped paths
          (a,m)=>E.of(
            //from action map
            a,
            //delete each path
            (i,p)=>(
              //delete name for object
              E.map(o,m).delete(c(p,n.split('.').pop())),
              //clean-up action map
              !E.map(o,m).size&&E.map(o).delete(m)
            //done deleting
            )
          //done looping paths
          )
        //done looping action maps
        ),
        //clean-up object maps
        [e,o].map(o=>!E.map(o).size&&E.map().delete(o)),
        //also release children
        E.on(o,k=>E.rel(o[k],c(n,k),o,s))
      //done releasing
      )
    //done with release
    ),
    //enqueue reactions
    enq:(v,l,o,g,d,n,r,f)=>(
      //v=value currently
      //l=label path
      //o=object parent
      //g=gathered reactions
      //s=sanity check

      //d=delegator path split
      d=l.split('.'),
      //n=name of last delegator
      n=d.pop(),
      //r=relative path
      r=d.join('.'),
      //is function
      f=l.endsWith('()'),

      //if not a wildcard name return n to d
      n!='*'&&!f&&d.push(n),

      //traverse objects
      E.of(
        //get object from map
        E.map(o),
        //if the weakmap runs out
        (p,w,m)=>!i(m=w.deref())
          //p=path map
          //w=weakref
          //m=map of actions

          //delete actions map
          ?E.map(o).delete(w)
          //if not not run out yet
          :E.of(
            //each path path
            p,
            //loop item paths 
            (u,p,s)=>t(g,m).has(s=c(p,l))||(
              //add to gathered reactions
              t(g,m).set(s,[
                //if function send return and arguments
                f?v[0]:o,
                //otherwise send new and old values
                f?v[1]:a(e(v)),
                //string path
                s,
                //dispatch array
                d
              ]),
              //debug report
              //console.log(`ENQUEUE ${s}:`,t(g,m).get(s)),
              //enqueue parents
              E.enq(o,c(d.length>1?r:p.split('.').pop(),'*'),u||o,g)
            )
          )
      )
    //done with enqueuing
    ),
    //run reactions
    run:g=>E.on(
      //from gathered reactions
      g,
      //loop maps
      (r,m,s)=>(
        E.on(
          //m=map locator
          //r=saved values

          //get saved values
          s=g.get(m),
          //loop through paths
          (r,p,t)=>(
            E.on(
              //p=path string
              //t=triggers

              //loop triggers
              t=m.get(p)||[],
              //loop functions
              (r,f,n,v)=>(
                //f=function
                //n=additial arguments

                //get array of additional arguments
                n=t.get(f),
                //get values to pass to the function
                v=[...s.get(p)],
                //loop path array to get proper object
                v.pop().map(
                  //dig deep to path of object
                  k=>v[0]=v[0]?.[k]
                //done looping
                ),
                //add function to run array
                r.unshift([f,v,n]),
                //return run array
                r
              ),
              //into run array
              r
            ),
            //into run array
            r
          ),
          //into run array
          r
        ),
        r
      ),
      //run array
      []
    //loop run array
    ).map(
      //trigger each function
      ([f,v,n])=>(
        //debug report
        //console.log('TRIGGER:',f,...v,...n),
        f(...v,...n)
      )
    ).length,

    //get raw object
    raw:o=>i(o,R)
      //get raw object
      ?o[E.sym]
      //otherwise it's fine
      :o,
    //symbol
    sym:Symbol.for(R.name),

    //compare a and b
    is:(a,b,c)=>(
      //if not both objects
      !i(a)||!i(b)
        //compare with simple equals
        ?a===b
        //otherwise if same type
        :a.__proto__==b.__proto__
          //if we can use backup
          ?(c=E.on(v).reverse().reduce(
            //find the backup that matches
            (o,r)=>o||i(a,r)&&v.get(r).backup,
            //or fail if not found
            0
          ))
            //process backup
            ?E.is(c(a),c(b))
            //fallback to comparing keys
            :E.on(a).length==E.on(b).length
              //check each key for a perfect match
              ?E.on(a,(o,k)=>o&&E.is(a[k],b[k]),1)
              //if not we are done
              :0
        //if prototypes don't match we cant
        :0
    //done with compare function
    ),
    //assign a reactive
    as:(a,b)=>E.get(
      //update a
      E.up(
        //update a
        E.raw(a),
        //with b
        E.raw(b)
      )
    ),

    //object update
    up:(a,b,c)=>(
      //make sure both have the same constructor
      a?.constructor==b?.constructor&&
      // reverse value map and reduce to find updater
      (c=E.on(v).reverse().reduce(
        //find the updater that matches prototype
        (u,p)=>u||i(a,p)&&v.get(p).update,
        //or fail if not found
        0
      //return updater
      ))
        //if we have an updater use it to update
        ?c(a,b)
        //otherwise asign b
        :b
    ),
    //traverse object with function
    of:(o,f)=>(o||[]).forEach(f),
      //o=object
      //f=function
    //loop traversal
    on:(o,f=_=>_,s)=>(
      //o=object
      //f=function
      //s=start

      //if object
      i(o)
        //get keys array
        ?(
          //if is map
          i(o,Map)
            //expand keys
            ?[...o.keys()]
            //otherwise use Object keys
            :Object.keys(o||{})
        //done with heys
        ).sort()[
          //if no reduce source
          s===E.U
            //use map
            ?'map'
            //otherwise reduce
            :'reduce'
        //now map or reduce function with start value
        ](f,s)
        //otherwise replace if not an object
        :o
    ),
    //array includes
    in:(i,n)=>(i||[]).includes(n)
  //done with encapsulator
  },
  //expose to the world
  self[R.name]=R
//done creating reactive
))()
