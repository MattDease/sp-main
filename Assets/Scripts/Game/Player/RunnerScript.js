#pragma strict

private var player : Player;
private var playerId : String;
private var cam : GameObject;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    playerId = networkView.viewID.owner.guid;
    player = Util.GetPlayerById(playerId);
    player.gameObject = gameObject;
    player.playerScript = this;
    // Access model using:
    // player.gameObject.transform.Find("debug_runner");

    // TODO - Position players and generally fix issues caused by having multiple remote players.
    if(networkView.isMine){
        player.gameObject.rigidbody.velocity = Vector3.right;
        player.gameObject.rigidbody.interpolation = RigidbodyInterpolation.Interpolate;

        cam = GameObject.Find("MainCamera");
    }
    else{
        // Change layer so collisions with local player is ignored
        player.gameObject.layer = LayerMask.NameToLayer("Remote Players");
    }
}

// Do physics changes here
function FixedUpdate(){
    player.gameObject.rigidbody.velocity = Vector3.right;
}

function Update(){
    if(cam){
        // TODO better camera positioning that considers other players
        cam.transform.position.x = player.gameObject.transform.position.x;
    }
}
