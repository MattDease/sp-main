#pragma strict

private var lastSynchronizationTime : float = 0;
private var syncDelay : float = 0;
private var syncTime : float = 0;
private var syncStartPosition : Vector3 = Vector3.zero;
private var syncEndPosition : Vector3 = Vector3.zero;
private var runnerScript : RunnerScript;
private var game : Game;

function Start(){
    runnerScript = GetComponent(RunnerScript);
    game = GameObject.Find("/GameManager").GetComponent(GameSetupScript).game;
}

function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo) {
    if(game && game.getState() == GameState.Ended){
        return;
    }
    var posX : float = 0;
    var posY : float = 0;
    var velocity : Vector3 = Vector3.zero;
    if (stream.isWriting) {
        posX = transform.position.x;
        posY = transform.position.y;
        velocity = rigidbody.velocity;
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

        rigidbody.velocity = velocity;

        if(runnerScript){
            syncStartPosition = transform.position;
            syncEndPosition = Vector3(posX, posY, runnerScript.depth) + velocity * syncDelay;
            syncEndPosition.z = runnerScript.depth;
        }
    }
}

function Update(){
    if (!networkView.isMine){
        syncTime += Time.deltaTime;
        transform.position = Vector3.Lerp(syncStartPosition, syncEndPosition, syncTime / syncDelay);
    }
}
