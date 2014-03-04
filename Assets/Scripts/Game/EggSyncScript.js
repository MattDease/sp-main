#pragma strict

private var lastSynchronizationTime : float = 0;
private var syncDelay : float = 0;
private var syncTime : float = 0;
private var syncStartPosition : Vector3 = Vector3.zero;
private var syncEndPosition : Vector3 = Vector3.zero;
private var eggScript : EggScript;

function Start(){
    eggScript = GetComponent(EggScript);
    syncStartPosition = transform.position;
    syncEndPosition = transform.position;
}

function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
    if(eggScript == null || eggScript.holder == null){
        return;
    }
    var posX : float = 0;
    var posY : float = 0;
    var velocity : Vector3 = Vector3.zero;
    if (stream.isWriting) {
        posX = transform.position.x;
        posY = transform.position.y;
        velocity = eggScript.holder.gameObject.rigidbody.velocity;
        stream.Serialize(posX);
        stream.Serialize(posY);
        stream.Serialize(velocity);
    }
    else {
        stream.Serialize(posX);
        stream.Serialize(posY);
        stream.Serialize(velocity);

        syncTime = 0;
        syncDelay = Time.time - lastSynchronizationTime;
        lastSynchronizationTime = Time.time;

        syncStartPosition = transform.position;
        // May not be correct to always use holder velocity when egg is in transit
        // But this is better than always not using the holder velocity when in transit
        syncEndPosition = Vector3(posX, posY, transform.position.z) + velocity * syncDelay;

    }
}

function Update(){
    if (!networkView.isMine){
        if(Util.IsNetworkedPlayerMe(eggScript.holder) && !eggScript.inTransit){
            transform.position.x = eggScript.holder.getPosition().x;
            transform.position.y = eggScript.holder.getPosition().y;
        }
        else{
            syncTime += Time.deltaTime;
            var pos : Vector3 = Vector3.Lerp(syncStartPosition, syncEndPosition, syncTime / syncDelay);
            transform.position.x = pos.x;
            transform.position.y = pos.y;
        }
    }
}

