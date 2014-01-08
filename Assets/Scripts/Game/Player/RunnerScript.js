#pragma strict

private var player : Player;
private var playerId : String;
private var cam : GameObject;

private var currentSpeed : float = Config.RUN_SPEED;
private var isCrouched : boolean = false;
private var isGrounded : boolean = true;
private var crouchTime : float = 0;


function OnNetworkInstantiate (info : NetworkMessageInfo) {
    playerId = networkView.viewID.owner.guid;
    player = Util.GetPlayerById(playerId);
    player.gameObject = gameObject;
    player.controller = this;
    // Access model using:
    // player.gameObject.transform.Find("debug_runner");

    // TODO - Position players and generally fix issues caused by having multiple remote players.
    if(networkView.isMine){
        player.gameObject.rigidbody.velocity.x = currentSpeed;
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
    player.gameObject.rigidbody.velocity.x = currentSpeed;
}

function Update(){
    if(cam){
        // TODO better camera positioning that considers other players
        cam.transform.position.x = player.gameObject.transform.position.x;
    }
    if(isCrouched && Time.timeSinceLevelLoad - crouchTime > Config.CROUCH_DURATION){
        unCrouch();
    }
}

function jump(){
    if(isCrouched){
        unCrouch();
    }
    else{
        // TODO only jump if on ground (use raycast)
        if(isGrounded) player.gameObject.rigidbody.velocity.y = Config.JUMP_SPEED;
    }
}

function crouch(){
    crouchTime = Time.timeSinceLevelLoad;

    if(isCrouched) return;
    isCrouched = true;

    // TEMP. replace with animation
    player.gameObject.transform.localScale.y = 0.5;
}

function unCrouch(){
    if(!isCrouched) return;
    isCrouched = false;

    // TEMP. replace with animation
    player.gameObject.transform.localScale.y = 1;
}

function startWalk(){
    currentSpeed = Config.WALK_SPEED;
}

function stopWalk(){
    currentSpeed = Config.RUN_SPEED;
}

function OnCollisionEnter(theCollision : Collision){
    if(theCollision.gameObject.tag == "levelSegment")
        isGrounded = true;
}

//consider when character is jumping .. it will exit collision.
function OnCollisionExit(theCollision : Collision){
    if(theCollision.gameObject.tag == "levelSegment")
        isGrounded = false;
}
