#pragma strict

private var lastSynchronizationTime : float = 0;
private var syncDelay : float = 0;
private var syncTime : float = 0;
private var syncStartPosition : Vector3 = Vector3.zero;
private var syncEndPosition : Vector3 = Vector3.zero;

function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
    var position : Vector3 = Vector3.zero;
    if (stream.isWriting) {
        position = transform.position;

        stream.Serialize(position);
    }
    else {
        stream.Serialize(position);

        syncTime = 0;
        syncDelay = Time.time - lastSynchronizationTime;
        lastSynchronizationTime = Time.time;

        syncStartPosition = transform.position;
        syncEndPosition = position;
    }
}

function Update(){
    if (!networkView.isMine){
        syncTime += Time.deltaTime;
        transform.position = Vector3.Lerp(syncStartPosition, syncEndPosition, syncTime / syncDelay);
    }
}
