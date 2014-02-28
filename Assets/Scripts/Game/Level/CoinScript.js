#pragma strict

private var alive : boolean;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    alive = true;
}

function isAlive(){
    return alive;
}

function notifyKill(){
    if(alive){
        if(Network.isServer){
            kill();
        }
        else{
            networkView.RPC("kill", RPCMode.Server);
        }
    }
}

@RPC
function kill(){
    //TODO track coin kills on server
    alive = false;
    Util.Toggle(gameObject, false);

    networkView.RPC("syncKill", RPCMode.OthersBuffered);
}

@RPC
function syncKill(){
    alive = false;
    Util.Toggle(gameObject, false);
}
