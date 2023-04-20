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

      //register action for path
      return !!t(this.#a,p).set(c,a)
      
    //done with watch method
    }
    
    //unwatch(path,callback)
    unwatch(p,c){
      //p=path
      //c=callback

      //reduce action to boolean
      return !!(
        //do we have a path
        p
          //find it or fake it
          ?this.#a.get(p)||new Map
          //or use everything
          :(c=0)&&this.#a
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
        //assign live data
        r,
        //the backup
        a(s.getItem(k)||_.#b)
      );
      //setup automatic saving to storage
      _.watch('*',n=>s.setItem(k,e(r)))
      
    //done with backup method
    }
    
    //restore(object)
    restore(o){
      //internal shortener
      const _=this,
      //backup object
      b=a(o||_.#b),
      //current object
      c=_.#c;

      //search for any extrak keys and delete
      E.on(E.as(c,b),k=>b[k]===a.U&&delete c[k])

      //checkpoint backup
      _.backup()
      
    //done with restore method
    }
    
    //register(object, handler)
    static register(o,h){
      //register handler
      v.set(o,h)
    //done with register method
    }
    
    //trigger(object path)
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
        o.raw||o
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
    //done with register method
    }
    //compare two obects fot changes
    static compare(a,b){
      //run interna compare
      return E.is(a,b)
    //done with compare function
    }

  //done with class
  },
  //encode to string
  e=$=>((j,s,r,c)=>(
    //if jump reference exists
    c=v=>(z=>
      j.has(v)
        //get the value
        ?j.get(v)
        //otherwise
        :(
          //set the jump reference
          j.set(
            //from value
            v,
            //push return value
            r.push(
              //if value is a number
              typeof v=='number'
                //convert to string (Infinity, Epsilon, NaN)
                ?{'#':v+''}
                //if its an object
                :i(v)
                  //push zap object
                  ?z
                  //if undefined
                  :v==r.U
                    //reference undefined
                    ?-1
                    //otherwise return value
                    :v
            //set as key
            )-1
          //set the jump reference
          ),
          //if it's an object
          i(v)&&(
            //loop through possible parents
            E.on(
              s,
              //check if inherited from parent
              (r,k)=>r||=i(v,k)
                //if so set name
                ?z[k.name]=c(s.get(k)(v))
                //otherwise use return
                :r,
              //start as zero
              0
            //if no parent found loop keys
            )||E.on(
              v,
              //for each zap
              k=>z[
                //if it's an arroa
                v.map
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
    //set zap host
    )(
      //if value is an array
      v?.map
        //zap is array
        ?[]
        //otherwise object
        :{}
    //done with collector
    ),
    //now collect object
    c($),
    //finally strigify the array
    JSON.stringify(r)
  //populate jump sorce and substitutions
  ))(
    //jump source
    new Map,
    //substitution map
    new Map(E.on(v,k=>[k,v.get(k).simplify||(_=>_)])),
    //return array
    []
  //done with encoder
  ),
  //activate to object
  a=$=>((s,r,c)=>(
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
            //for falue
            v,
            //object key is number
            (v,k)=>parseInt(k)>=0
              //then process object
              ?(
                //get value sub
                v[
                  //if array
                  v.map
                    //key is a number
                    ?k
                    //otherwise key is a retrurn value
                    :r[k]
                //set return value
                ]=r[v[k]],
                //if not a map delete the key
                !v.map&&(delete v[k]),
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
    new Map(E.on(v,k=>[k.name,v.get(k).reconstitute||(_=>_)])),
    //reference array
    JSON.parse($)
  //done activating object
  ),
  //collate names
  c=(l,n)=>l?l+'.'+n:n,
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
  v=((w,s,r,c)=>new Map([
    [Array,{
      [w]:_=>['push','pop','shift','unshift']
    }],
    //Dates
    [Date,{
      [s]:v=>v.toJSON(),
      [r]:v=>new Date(v),
      [c]:(a,b)=>a+''==b,
      [w]:_=>Object.getOwnPropertyNames(Date.prototype)
        .filter(k=>k.startsWith('set'))
    }],
    //Regular Expressions
    [RegExp,{
      [s]:v=>[v.source,v.flags],
      [r]:v=>new RegExp(...v),
      [c]:(a,b)=>a+''==b,
    }],
    //Maps
    [Map,{
      [s]:v=>[...v.entries()],
      [r]:v=>new Map(v),
      [c]:(a,b)=>v(a.entries(),b.entries()),
      [w]:_=>['set','delete','clear']
    }],
    //Sets
    [Set,{
      [s]:v=>[...v.values()],
      [r]:v=>new Set(v),
      [c]:(a,b)=>v(a.values(),b.values()),
      [w]:_=>['add','delete','clear']
    }]
  //done with value map
  ]))('watchMethods','simplify','reconstitute','compare'),
  //encapsulator
  E={
    //prototype is Reactive.prototype
    getPrototypeOf:_=>E.pt,
    //trap getter
    get:(o,n)=>(
      //iflooking for raw
      n=='raw'
        //return object
        ?o
        //if object
        :i(
          //if we don't have a name
          o=n===E.U
            //use parent
            ?o
            //otherwise use child
            :o[n]
        //regardles test if object
        )
          //proxy wrap new object
          ?new Proxy(o,E)
          //otherwise no need to wrap
          :o
    //done with set function
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
      e=e.raw||e,
      //set the name and heldover parents
      p=o||p,
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
    //delete are just setting to undefined
    deleleProperty:(o,n,e)=>E.set(o,n,E.U,e),
    //trap execution
    apply:(f,o,r,g=new Map,s,h)=>(
      //save arguments
      s=a(e(r)),
      //object target must be raw
      o=o.raw,
      //set handler
      h=E.as(
        //if undefined we still need a function 
        {[w]:_=>[]},
        //search for handler
        E.on(v,(a,r)=>a||i(o,r)&&v.get(r),0)
      //return handler
      ),
      //run function
      r=f.apply(o,r),
      //if function name in handler reactive enqueue reactions
      E.in(h.watchMethods(),f.name)&&E.enq([r,s],f.name+'()',o,g),
      //run reactions
      E.run(g),
      //return result
      r
    //done with appy function
    ),

    //map objects
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
              !E.map(o,m).size&&t($,o).delete(m)
            //done deleting
            )
          //done looping paths
          )
        //done looping action maps
        ),
        //clean-up object
        [e,o].map(o=>!E.map(o).size&&E.map().delete(o)),
        //also release children
        E.on(o,k=>E.rel(o[k],c(n,k),o,s))
      //done releasing
      )
    //done with release funtion
    ),
    //enqueue reactions
    enq:(v,l,o,g,s=new Set,d,n,r,f)=>(
      //v=urrent value
      //l=label path
      //o=object parent
      //g=gathered reactions
      //s=sanity check

      //delegator path split
      d=l.split('.'),
      //name of last delegator
      n=d.pop(),
      //relative path
      r=d.join('.'),
      //is function
      f=l.endsWith('()'),
      //if normal return n to d
      n!='*'&&!f&&d.push(n),
      
      //traverse objects
      i(o)&&!s.has(o)&&E.of(
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
                  E.get(f?v[0]:o),
                  //otherwise send new and old values
                  f?v[1]:a(e(v)),
                  //path string
                  p,
                  //dispatch array
                  d
                //done with values
                ],
                //now saved argumetns
                ...n
              //done enqueuing action
              ])
            //done looping paths
            )
          //done looping item paths
          )
        //done looping path map
        )
      //done traversing objects
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

              //loop path array
              v.pop().map(
                //dig deep to path
                k=>v[0]=v[0][k]
              //done looping
              );

              //run callback with values and attributes
              c(...v,...a);
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
    
    //compare a and b
    is:(a,b)=>(
      //if values map has it
      v.has(a)
        //use comparison function
        ?a.__proto__==b.__proto__&&(v.get(a).compare||E.is)(a,b)
        //otherwise if not both objects
        :!i(a)||!i(b)
          //just compare with simple equals
          ?a===b
          //otherwise
          :E.on(a).length!=E.on(b).length
            //return negative
            ?0
            //otherwise check each key for a perfect match
            :E.on(c,(o,k)=>o&&E.is(a[k],b[k]),1)
    //done with compare function
    ),
    //shorten object assign
    as:Object.assign,
    //forEach traverser
    of:(o,f)=>(o||[]).forEach(f),
    //loop traversal
    on:(o,m=_=>_,r)=>i(o)
      //if object loop get keys
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
        r===E.U
          //map
          ?'map'
          //otherwise reduce
          :'reduce'
      //now call function with mapped function and return value
      ](m,r)
      //
      :o,
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
