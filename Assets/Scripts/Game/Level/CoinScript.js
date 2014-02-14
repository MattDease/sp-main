#pragma strict


function OnNetworkInstantiate (info : NetworkMessageInfo) {

}

function notifyKill(){
    if(Network.isServer){
        kill();
    }
    else{
        networkView.RPC("kill", RPCMode.Server);
    }
}

@RPC
function kill(){
    Network.Destroy(gameObject);
}
