#pragma strict

public var min : Vector2;
public var max : Vector2;

private var initialPosition : Vector2;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    initialPosition = gameObject.transform.position;
}

function notifyPosition(position : Vector3){
    var diff : Vector2 = position - initialPosition;
    if(gameObject.CompareTag("moveableX")){
        if(diff.x < min.x){
            position.x = initialPosition.x + min.x;
        }
        else if(diff.x > max.x){
            position.x = initialPosition.x + max.x;
        }
    }
    else if(gameObject.CompareTag("moveableY")){
        if(diff.y < min.y){
            position.y = initialPosition.y + min.y;
        }
        else if(diff.y > max.y){
            position.y = initialPosition.y + max.y;
        }
    }
    if(position != gameObject.transform.position){
        if(Network.isServer){
            setPosition(position);
        }
        else{
            networkView.RPC("setPosition", RPCMode.Server, position);
        }
    }
}

@RPC
function setPosition(position : Vector3){
    gameObject.transform.position = position;
}
