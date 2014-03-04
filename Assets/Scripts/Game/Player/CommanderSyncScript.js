#pragma strict

private var lastSynchronizationTime : float = 0;
private var syncDelay : float = 0;
private var syncTime : float = 0;
private var syncStartPosition : Vector3 = Vector3.zero;
private var syncEndPosition : Vector3 = Vector3.zero;

function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
    var posX : float = 0;
    var posY : float = 0;
    if (stream.isWriting) {
        posX = transform.position.x;
        posY = transform.position.y;

        stream.Serialize(posX);
        stream.Serialize(posY);
    }
    else {
        stream.Serialize(posX);
        stream.Serialize(posY);

        syncTime = 0;
        syncDelay = Time.time - lastSynchronizationTime;
        lastSynchronizationTime = Time.time;

        syncStartPosition = transform.position;
        syncEndPosition = Vector3(posX, posY, transform.position.z);
    }
}

function Update(){
    if (!networkView.isMine){
        syncTime += Time.deltaTime;
        transform.position = Vector3.Lerp(syncStartPosition, syncEndPosition, syncTime / syncDelay);
    }
}
