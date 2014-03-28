#pragma strict

private var lastSynchronizationTime : float = 0;
private var syncDelay : float = 0;
private var syncTime : float = 0;
private var syncStartPosition : Vector3 = Vector3.zero;
private var syncEndPosition : Vector3 = Vector3.zero;
private var syncStartRotation : Quaternion = Quaternion.identity;
private var syncEndRotation : Quaternion = Quaternion.identity;
private var model : GameObject;
private var commanderScript : CommanderScript;

function Start() {
    model = gameObject.transform.Find("model").gameObject;
    commanderScript = GetComponent(CommanderScript);
}

function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
    if(!model){
        return;
    }

    var posX : float = 0;
    var posY : float = 0;
    var rotation : Quaternion = Quaternion.identity;

    if (stream.isWriting) {
        posX = transform.position.x;
        posY = transform.position.y;
        rotation = model.transform.rotation;

        stream.Serialize(posX);
        stream.Serialize(posY);
        stream.Serialize(rotation);
    }
    else {
        stream.Serialize(posX);
        stream.Serialize(posY);
        stream.Serialize(rotation);

        syncTime = 0;
        syncDelay = Time.time - lastSynchronizationTime;
        lastSynchronizationTime = Time.time;

        if(commanderScript){
            syncStartPosition = transform.position;
            syncEndPosition = Vector3(posX, posY, commanderScript.depth);
            syncStartRotation = model.transform.rotation;
            syncEndRotation = rotation;
        }
    }
}

function Update(){
    if (!networkView.isMine && model){
        syncTime += Time.deltaTime;
        transform.position = Vector3.Lerp(syncStartPosition, syncEndPosition, syncTime / syncDelay);
        model.transform.rotation = Quaternion.Slerp(syncStartRotation, syncEndRotation, syncTime / syncDelay);
    }
}
