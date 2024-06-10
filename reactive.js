let currentEffect = null;
// weackMap is a garbage colection friendly data structure
//it only accepts objects as key
//so we give our proxy objects to it as keys
const targetMap = new WeakMap();

// the effect (job) that we want to be done
//it get that (job) as a callback
function effect(callback) {
  //when the (job) is done we no longer need the callback (job)
  //to be there so we made (currentEffect) variable to make it null
  //after job is done so next in (track) function we will not track the
  //job that already has been done
  if (!currentEffect) {
    currentEffect = callback;
    currentEffect();
  }
  currentEffect = null;
}

//when ever we to a get methoud on our proxy object (like obj.count)
//we need this function to be run , because it is in sync with our effect
//so it means effect (as jobs we want to be done ) and track (fro adding the jobs we want
//to be done in the list )
//so for example we say we want to see the resault of count now (obj.count=> ressault for example= 1)
//so this is the job we want to be done and we ask it with get (obj.something)
function track(target, prop) {
  //if we already have any callback to run so lets go and put it into the list of jobs that should be done
  if (currentEffect) {
    //for the current proxy object dose we have that proxy object(target) as key in our weakmap?

    let depsMap = targetMap.get(target);
    //if no so let make some key value pairs !
    //because we should do ! becase it has been requested for current
    //object with users get method request (obj.something) to check if its
    //exist so list my job in it (in this key's(proxyObject) value(Map) for the property i want and
    // i requested (prop) (with obj.something))
    //the (something) is the property he wants us to list the effects for it
    //like (something=>{eff,eff,eff})
    if (!depsMap) {
      // sence we want each effect to get run only base on the property that we ask for
      //and we do not want all effects to be in one big list with no order
      //so then all will get run no matter if we only asked for (obj.count)
      //so if want to prevent these conflicts and problems
      //we need to say for each property (as key) set it's own effect (as value)
      // like {count=>{eff,eff,eff} , show=>{eff,eff,eff}}
      //so then we can run each properties effects that we wish to
      depsMap = new Map();
      //so now we made our Map data structure
      //it's time to say for the curent proxyObject (as the key) we want
      //this Map (as it value)
      //so like = {proxyObject(as key)=>{Map(as Value)}}
      targetMap.set(target, depsMap);
    }
    //now it's time to check inside that Map we already made
    //to see if we have any preperty that currently has been
    // requested by user through get methoud (obj.something) inside the Map or no?

    let deps = depsMap.get(prop);
    // if no so we need to make it because it has been requested by user for current in use prop
    if (!deps) {
      //we make a set for listing the users jobs (effects) for the current key (prop) of current
      //object (target) so we use set because we only need a simple data structure to list and keep
      //jobs that should be done for a prop in one place as list and why not array
      //because we do not want repeated effects!
      deps = new Set();
      //set the list(set) as value for the current prop as key
      //so each job will be listed for it coresponding prop
      //so user asks us a job about (count) property
      //so we do not list it in (show,name,age and so on...) too !
      //and we only list it in (count) property as he wish!
      depsMap.set(prop, deps);
    }
    // finaly we add the jobs (effects) to the Set we made through this part
    //and it only will be added for the current in use object and current in use prop
    deps.add(currentEffect);
  }
}

//here we trigger to run all those jobs we listed again
//base on users request but this time on setter (obj.count=1)
//this (=1) means we set now
//so why on setter we run those all listed effects?
//becuse here we update the object
//so jobs we want to be done should alwayse be shown in updated
//new values not old once!
//so we update the object , then we trigger the effects (to be call) and then
//we have updated valued to be shown in effects where user asks for get (obj.count)
function trigger(target, prop) {
  //do we have the value for current proxyObject (key) that user used it to set something
  //(to update object)
  //if we do , so it will be a Map as we know and it will
  //get saved into depsMap variable
  const depsMap = targetMap.get(target);
  //we have not just gaurd close and prevent the rest of the program to run
  if (!depsMap) return;
  //but if we have then get the current prop that user , sets with setter (like = obj.count=1)
  //so get that current prop that user updated
  //and save it into deps variable
  //and now as we know the Maps value was a (Set) data structure
  //basicly a lisy of all jobs for that property
  //so now we can lopp over it and call all those jobs for current prop
  //and give the user the new updated values scenes this calling happening after
  //updating phase of the object in setter funciton of that object
  const deps = depsMap.get(prop);
  if (deps) {
    deps.forEach((effect) => effect());
  }
}

function reactiveIt(object) {
  const handler = {
    //this is the get methoud we were talking about
    //in track function mostly .
    //so this methoud gets into action when ever user
    //asks for a value (wants to get a value)
    get(target, prop) {
      track(target, prop);
      return target[prop];
    },
    //and here is the set methoud we were talking about
    //mostly in trigger function.
    //so this one gets into action when ever user
    //updates a value (sets a value) in proxy object
    set(target, prop, value) {
      target[prop] = value;
      trigger(target, prop);
      return true;
    },
  };
  return new Proxy(object, handler);
}

export { reactiveIt, effect };
