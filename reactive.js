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
    //actions
    #a=new Map;
    //backup
    #b;
    //core object
    #c;

    //constructor(object)
    constructor(o){
        //o=object
        
        //return
        return(_=>(
          //must be a raw object
          o=E.raw(o),
          //add backup
          _.#b=e(o),
          //setup object
          E.map(o,_.#a).set(''),
          //register children
          E.reg(o),
          //setup proxy
          new Proxy(
            //setup current
            _.#c=E.get(o),
            //setup root handler
            {
              //if requesting function
              get:(o,n)=>_[n]?.call
                //return bound funtion
                ?_[n].bind(_)
                //otherwise return proxied
                :_[n]||o[n]
            //done with root handler
            }
          //done with proxy
          )
        //populate closure with this
        ))(this)
    //done with constructor
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
      E.as(
        //assign to live data
        r,
        //from the backup
        a(s.getItem(k)||_.#b)
      );
      //setup automatic saving to storage
      _.watch('*',n=>s.setItem(k,e(r)))
    //done with backup method
    }

    //restore(object)
    restore(o){
      //internal shortener
      const _=this;
      //assign restoration
      E.as(
        //if object is passed
        i(o)
          //use as is
          ?o
          //otherwise assemble the object
          :a(o||_.#b),
        //current object
        _.#c
      );
      //checkpoint backup
      _.backup()
    //done with restore method
    }

    //create a new map of the current reactive obj
    clone(){
      //generate a new data tree and pass to constructor
      return new this.constructor(a(e(this.#c)))
    //done with clone method
    }

    static register(o,h){
      //register handler
      v.set(o,h)
    //done with register method
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
      return E.is(a,b)
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
        //populate our map with simplify functions
        k=>[k,v.get(k).simplify]
        //remove anthing that doesn't have a simplify function
        ).filter(m=>m[1])
        //reverse to create correct president
        .reverse()
      //set substitution map
      ),
    //return array (always start with a blank array)
    []
    //run internal function to return encoded result
  ),
  //assemble JSON Array to object
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
      E.on(v,k=>[k.name,v.get(k).reconstruct||(_=>_)])
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
  v=((w,a,r,s)=>new Map([
    //w=watchMethods
    //a=assign
    //r=reconstruct
    //s=simplify
    
    //Object
    [Object,{
      [w]:_=>[],
      [a]:(a,b)=>E.on(Object.assign(a,b),k=>b[k]===a.U&&delete a[k])
    }],
    //Array
    [Array,{
      [w]:_=>['push','pop','shift','unshift']
    }],
    //Regular Expressions
    [RegExp,{
      [s]:v=>[v.source,v.flags],
      [r]:v=>new RegExp(...v)
    }],
    //Dates
    [Date,{
      [w]:_=>Object.getOwnPropertyNames(Date.prototype).filter(k=>k.startsWith('set')),
      [a]:(a,b)=>a.setTime(b.getTime()),
      [r]:v=>new Date(v),
      [s]:v=>v.toJSON()
    }],
    //Sets
    [Set,{
      [w]:_=>['add','delete','clear'],
      [a]:(a,b)=>(
        //delete stuff that is not common
        s1.difference(s2).forEach(s=>s1.delete(s)),
        //add stuff that is new
        s2.difference(s1).forEach(s=>s1.add(s)),
        // return the first set
        s1
      ),
      [s]:v=>[...v.values()],
      [r]:v=>new Set([...v])
    }],
    //Maps
    [Map,{
      [w]:_=>['set','delete','clear'],
      [a]:(a,b,c=new Map)=>(
        //fill replacements array
        b.forEach((v,k)=>c.set(e(k),v)),
        //loop through current stuff
        a.forEach((v,k,d)=>(
          //check if you have this one
          c.has(e(k))
            //if it's different assign
            ?e(d=c.get(e(k)))!=e(v)&&a.set(k,d)
            //if it's gone delete
            :a.delete(k)
        )),
        a
      ),
      [s]:v=>[...v.entries()],
      [r]:v=>new Map(v)
    }]
  //done with value map
  ]))('watchMethods','assign','reconstruct','simplify'),
  //encapsulator
  E={
    //prototype is Reactive.prototype
    getPrototypeOf:_=>E.pt,
    //trap getter
    get:(o,n)=>(
      //if looking for raw
      n=='raw'
        //return object
        ?o
        //if object
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
    //done with get function
    ),
    //trap setter
    set:(o,n,e,s,g=new Map,p,u)=>(
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
      )
    //done with set function
    ),
    //delete property  is just setting to undefined
    deleleProperty:(o,n,e)=>E.set(o,n,E.U,e),
    //trap execution
    apply:(f,o,r,g=new Map,s=new Set,h,w)=>(
      //save arguments
      w=a(e(r)),
      //object target must be raw
      o=o.raw,
      //set handler
      h=E.in(
        //search for handler
        E.on(v,(a,r)=>a||i(o,r)&&v.get(r).watchMethods(),0)||[],
        //search for name in watched
        f.name
      ),
      //enqueue reaction parent if watch method
      h&&E.enq(o,'*',o,g,s),
      //run function
      r=f.apply(o,r),
      //enqueues reaction if watched method
      h&&E.enq([r,w],f.name+'()',o,g,s),
      //if we are watching run reactions
      h&&E.run(g),
      //return result
      r
    //done with appy function
    ),

    //map objects one universal map of objects
    map:(_=>(...a)=>t(_,...a))(new WeakMap),
    //register objects
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
    //done with register function
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
    //done with release funtion
    ),
    //enqueue reactions
    enq:(v,l,o,g,s=new Set,d,n,r,f)=>(
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
      f=f=l.endsWith('()'),

      //if not a wildcard name return n to d
      n!='*'&&!f&&d.push(n),

      //traverse objects
      i(o)&&!s.has(v)&&E.of(
        //get object from map
        E.map(o),
        //loop path map
        (p,m)=>E.of(
          //each path
          p,
          //loop item paths
          (u,p)=>(
            //maintain sanity
            i(v)&&s.add(v),
            //debug
            //console.log('enqueue:',c(p,l),c(p,n),c(p,v?n:l)),
            //enqueue parents
            E.enq(o,c(d.length>1?r:p.split('.').pop(),'*'),u||o,g,s),
            //loop paths from the action map
            E.of(
              //find path from map if empty
              m.get(p=c(p,l)),
              //enqueue each action
              (n,c)=>t(g,p,o).set(c,[
                //setup values array
                [
                  //if function send return and arguments
                  f?v[0]:o,
                  //otherwise send new and old values
                  f?v[1]:a(e(v)),
                  //path string
                  p,
                  //dispatch array
                  d
                //done with values
                ],
                //now saved arguments
                ...n
              //done enqueuing action
              ])
            //done looping paths
            )
          //done looping item paths
          )
        //done looping path map
        )
      //done traversinguobjects
      )
    //done with enqueuing reactions
    ),
    //run reactions
    run:(m,d=0)=>(
      //sort reactions paths
      [...m.keys()].sort(
        //sort alphabetically
        (a,b)=>a<b?1:-1
      //loop paths
      ).map(
        //loop objects
        k=>E.of(
          //traverse key
          t(m,k),
          //loop callbacks
          o=>E.of(
            o,
            //do callback
            async(a,c,v)=>{
              ++d;

              //get values
              v=a.shift();

              //console.log('trigger:',v[2]),

              //loop path array
              v.pop().map(
                //dig deep to path
                k=>v[0]=v[0]?.[k]
              //done looping
              );

              //if something changed
              //if(v[2].slice(-2)=='()'||!E.is(...v)){
                //wrap returned argument as reactive
                v[0]=E.get(v[0]);
                //run callback
                c(...v,...a)
              //done with check
              //}
            //done with callback
            }
          //done looping callbacks
          )
        //done looping objects
        )
      //done looping paths
      ),
      //return dispatched
      d
    //done with run function
    ),
    //get raw object
    raw(o){
      //if it's reactive
      return i(o,R)
        //get raw object
        ?o.raw
        //otherwise it's fine
        :o
    },

    //compare a and b
    is:(a,b,c)=>(
      //if not both objects
      !i(a)||!i(b)
        //compare with simple equals
        ?a===b
        //otherwise if same type
        :a.__proto__==b.__proto__
          //if we can use simplification
          ?(c=E.on(v).reverse().reduce(
            //find the simplifier that matches
            (o,r)=>o||i(a,r)&&v.get(r).simplify,
            //or fail if not found
            0
          ))
            //process as simplifier
            ?E.is(c(a),c(b))
            //fallback to comparing keys
            :E.on(a).length==E.on(b).length
              //check each key for a perfect match
              ?E.on(c,(o,k)=>o&&E.is(a[k],b[k]),1)
              //if not we are done
              :0
        //if prototypes don't match we cant
        :0
    //done with compare function
    ),
    //object assign
    as:(a,b,c)=>(
      (c=E.on(v).reverse().reduce(
        //find the simplifier that matches
        (o,r)=>o||i(a,r)&&v.get(r).assign,
        //or fail if not found
        0
      ))
        ?c(a,b)
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
        )[
          //if no reduce source
          s===E.U
            //map
            ?'map'
            //otherwise reduce
            :'reduce'
        //now call function with mapped function and return value
        ](f,s)
        //otherwise not an object
        :o
    ),
    //array includes
    in:(i,n)=>(i||[]).includes(n),
    //shorten prototype
    pt:R.prototype
  //done with encapsulator
  },
  //expose to the world
  self[R.name]=R
//done with reactive
))()
