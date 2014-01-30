#pragma strict

function notifyPosition(position : Vector3){
    if(Network.isServer){
        setPosition(position);
    }
    else{
        networkView.RPC("setPosition", RPCMode.Server, position);
    }
}

@RPC
function setPosition(position : Vector3){
    gameObject.transform.position = position;
}
