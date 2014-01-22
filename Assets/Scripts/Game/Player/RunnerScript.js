#pragma strict

private var player : Runner;
private var cam : GameObject;

private var currentSpeed : float = Config.RUN_SPEED;
private var isCrouched : boolean = false;
private var isGrounded : boolean = true;
private var canDoubleJump: boolean = false;
private var crouchTime : float = 0;

// TODO either move to config file or use mesh info
private var runnerWidth : float = 0.6;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    player = Util.GetPlayerById(networkView.viewID.owner.guid) as Runner;
    var teammates : Dictionary.<String,Player> = player.getTeam().getTeammates();

    player.gameObject = gameObject;
    player.controller = this;
    // Access model using:
    // player.gameObject.transform.Find("debug_runner");

    if(networkView.isMine){
        player.gameObject.rigidbody.velocity.x = currentSpeed;
        player.gameObject.rigidbody.interpolation = RigidbodyInterpolation.Interpolate;

        cam = GameObject.Find("MainCamera");
    }
    else{
        // Change layer so collisions with local player is ignored
        player.gameObject.layer = LayerMask.NameToLayer("Remote Players");

        // TODO Fix. Assumes own player is always the first to be instantiated
        player.gameObject.transform.position.z = teammates.Count * runnerWidth - runnerWidth/2;
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
    checkKeyboardInput();
}

function jump(){
    if(isCrouched){
        unCrouch();
    }
    else{
        // TODO only jump if on ground (use raycast)
        if(isGrounded || !isGrounded && canDoubleJump) {
            player.gameObject.rigidbody.velocity.y = Config.JUMP_SPEED;
            if(canDoubleJump) canDoubleJump = false;
        }
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
    if(theCollision.gameObject.tag == "levelSegment"){
      isGrounded = true;
      canDoubleJump = false;
    }
}

//consider when character is jumping .. it will exit collision.
function OnCollisionExit(theCollision : Collision){
    if(theCollision.gameObject.tag == "levelSegment") {
        isGrounded = false;
        canDoubleJump = true;
    }
}

/*
 *  INPUT
 */
function checkKeyboardInput(){
    if(networkView.isMine){
        if(Input.GetKeyDown(KeyCode.W)){
            jump();
        }
        if(Input.GetKeyDown(KeyCode.S)){
            crouch();
        }
        if(Input.GetKeyDown(KeyCode.A)){
            startWalk();
        }
        if(Input.GetKeyUp(KeyCode.A)){
            stopWalk();
        }
        if(Input.GetKeyUp(KeyCode.D)){
            // toss();
        }
    }
}

function OnEnable(){
    if(networkView.isMine){
        Gesture.onSwipeE += OnSwipe;
        Gesture.onLongTapE += OnLongTap;
        Gesture.onTouchE += OnTouch;
        Gesture.onTouchUpE += OnRelease;
        Gesture.onMouse1E += OnTouch;
        Gesture.onMouse1UpE += OnRelease;
    }
}

function OnDisable(){
    if(networkView.isMine){
        Gesture.onSwipeE -= OnSwipe;
        Gesture.onLongTapE -= OnLongTap;
        Gesture.onTouchE -= OnTouch;
        Gesture.onTouchUpE -= OnRelease;
        Gesture.onMouse1E -= OnTouch;
        Gesture.onMouse1UpE -= OnRelease;
    }
}

function OnSwipe(sw:SwipeInfo){
    // TODO - rewrite
    //Figure out what direction we are swiping
    if(sw.direction.x > 0  && sw.angle > 45 && sw.angle < 135 ) {
        jump();
    }

    if(sw.direction.x < 0  && sw.angle > 235 && sw.angle < 315 ) {
        crouch();
    }

    // TODO find target player based on swipe direction and pass them to a toss function
    // if(sw.direction.y > 0  && ((sw.angle > 0 && sw.angle < 45) || (sw.angle > 315 && sw.angle < 360)) )  {
    //     Toss(sw.direction, sw.speed);
    // }

    // if(sw.direction.y < 0  && sw.angle > 135 && sw.angle < 235 ) {
    //     Toss(sw.direction, sw.speed);
    // }
}

//called when a long tap event is ended
function OnLongTap(tap:Tap){

}

function OnTouch(pos:Vector2){
    startWalk();
}
function OnRelease(pos:Vector2){
    stopWalk();
}
