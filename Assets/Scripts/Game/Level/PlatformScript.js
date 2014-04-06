#pragma strict

public var min : Vector2;
public var max : Vector2;
public var gravity : boolean = false;

private var initialPosition : Vector2;
private var releaseThreshold : int = 0.2;
private var lastPositionTime : float = 0;
private var gravitySpeed : float = 3;

function OnNetworkInstantiate (info : NetworkMessageInfo) {

}

function initPlatform(){
    initialPosition = transform.position;
    GetComponent(PlatformSyncScript).initPlatformSync();
}

function Update(){
    if(networkView.isMine){
        if(gravity && transform.position.y > initialPosition.y + min.y && Time.time - lastPositionTime > releaseThreshold){
            var target : Vector3 = transform.position;
            target.y = min.y;
            syncPosition(Vector3.MoveTowards(transform.position, target, gravitySpeed * Time.deltaTime));
        }
    }
}

function notifyPosition(position : Vector3){
    var diff : Vector2 = position - initialPosition;
    lastPositionTime = Time.time;
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
    if(position != transform.position){
        syncPosition(position);
    }
}

function syncPosition(position : Vector3){
    if(Network.isServer){
        setPosition(position);
    }
    else{
        networkView.RPC("setPosition", RPCMode.Server, position);
    }
}

@RPC
function setPosition(position : Vector3){
    transform.position.x = position.x;
    transform.position.y = position.y;
}
