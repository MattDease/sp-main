#pragma strict

import System.Collections.Generic;

// Set in editor
public var cameraPrefab : GameObject;

public var depth : float = 0;

private var player : Runner;
private var model : GameObject;
private var animator : Animator;
private var team : Team;
private var camContainer : GameObject;
private var platform : GameObject;
private var egg : GameObject;
private var eggScript : EggScript;

private var currentSpeed : float = Config.RUN_SPEED;
private var runningPlane : Vector3;
private var cameraOffset : Vector2 = Vector2.zero;
private var prevPlatformPos : Vector2 = Vector2.zero;
private var isAttacking : boolean = false;
private var isGrounded : boolean = true;
private var isDoubleJump: boolean = false;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    player = Util.GetPlayerById(networkView.viewID.owner.ToString()) as Runner;
    model = gameObject.transform.Find("model").gameObject;
    animator = model.GetComponent(Animator);
    team = player.getTeam();

    player.gameObject = gameObject;
    player.script = this;
    player.controller = this;

    if(networkView.isMine){
        camContainer = Instantiate(cameraPrefab, Vector3.zero,  Quaternion.identity);

        var viewport : Vector3 = Camera.main.WorldToViewportPoint(gameObject.transform.position);
        viewport.x += Config.CAMERA_LEAD;
        Camera.main.transform.localPosition += Camera.main.ViewportToWorldPoint(viewport);

        player.gameObject.rigidbody.interpolation = RigidbodyInterpolation.Interpolate;

        runningPlane = player.getPosition();
    }
    else{
        Util.Toggle(gameObject, false);
    }
}

@RPC
function initRunner(teamId : int){
    if(!networkView.isMine){
        var me : Player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();

        team.runnerCreationCount++;

        // Change layer so collisions with local player is ignored
        player.gameObject.layer = LayerMask.NameToLayer("Remote Players");

        player.gameObject.transform.position.z += team.runnerCreationCount * Config.RUNNER_LANE_WIDTH;
        if(teamId != me.getTeamId()){
            player.gameObject.transform.position.z -= Config.RUNNER_LANE_WIDTH;
        }
        transform.position.z += (teamId == me.getTeamId()) ? 0 : Config.TEAM_DEPTH_OFFSET;
        depth = transform.position.z;
        Invoke("show", 0.3);
    }
}

// Do physics changes here
function FixedUpdate(){
    if(networkView.isMine && player.isAlive()){
        if(platform){
            gameObject.transform.position += Vector2(platform.transform.position.x, platform.transform.position.y) - prevPlatformPos;
            prevPlatformPos = platform.transform.position;
        }
        player.gameObject.rigidbody.velocity.x = currentSpeed;
    }
}

function Update(){
    var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
    var transState : AnimatorTransitionInfo = animator.GetAnimatorTransitionInfo(0);
    if(animState.IsName("Base Layer.Locomotion")){
        animator.SetBool("IsDoubleJump", false);
        animator.SetBool("HasDoubleJumped", false);
        animator.SetBool("Toss", false);
    }
    else if(animState.IsName("Base Layer.Jump")){
        if(!animator.IsInTransition(0)){
            animator.SetBool("Jump", false);
        }
        if(isDoubleJump){
            animator.SetBool("HasDoubleJumped", true);
        }
    }
    if(animState.IsName("Base Layer.AttackRight")){
        animator.SetBool("Attack", false);
    }
    if(networkView.isMine && player.isAlive()){
        var position : Vector3 = player.getPosition();
        if(Camera.main.WorldToViewportPoint(position).x < 0 || position.y < -1){
            GameObject.Find("/GameManager").networkView.RPC("killRunner", RPCMode.OthersBuffered, player.getId());
            player.kill();
            return;
        }
        if(!platform){
            var hit : RaycastHit;
            if(Physics.Raycast(gameObject.transform.position, Vector3.down, hit, 1)) {
                if(hit.collider.gameObject.CompareTag("moveableX") || hit.collider.gameObject.CompareTag("moveableY")){
                    platform = hit.collider.gameObject;
                    prevPlatformPos = platform.transform.position;
                }
            }
        }
        checkKeyboardInput();
    }
}

function LateUpdate(){
    if(networkView.isMine){
        if(player.isAlive()){
            cameraOffset += getCameraOffset();
            if(cameraOffset.x < 0){
                cameraOffset.x = 0;
            }
            camContainer.transform.position = player.getPosition() + cameraOffset;
        }
        else if(team.getRunners(true).Count > 0){
            camContainer.transform.position = team.getObserverCameraPosition();
        }
    }
}

function show(){
    Util.Toggle(gameObject, true);
}

@RPC
function jump(){
    if(isGrounded || !isGrounded && !isDoubleJump) {
        var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
        if(animState.IsName("Base Layer.Locomotion")){
            animator.SetBool("Jump", true);
            player.gameObject.rigidbody.velocity.y = Config.JUMP_SPEED;
        }
        else if(animState.IsName("Base Layer.Jump")){
            animator.SetBool("IsDoubleJump", true);
            isDoubleJump = true;
            player.gameObject.rigidbody.velocity.y = Config.JUMP_SPEED;
        }
    }
}

@RPC
function takeoff(){
    isGrounded = false;
    animator.SetBool("IsGrounded", false);
}

@RPC
function land(){
    isGrounded = true;
    animator.SetBool("IsGrounded", true);
    isDoubleJump = false;
}

@RPC
function attack(){
    animator.SetTrigger("Attack");
}

@RPC
function grab(){
    animator.SetTrigger("Catch");
}

function toss(forward : boolean){
    if(eggScript.isHoldingEgg(player.getId())){
        var target = team.getClosestRunner(player, forward);
        if(target){
            syncToss();
            networkView.RPC("syncToss", RPCMode.Others);
            egg.networkView.RPC("startThrow", RPCMode.All, target.getId());
        }
    }
}

@RPC
function syncToss(){
    animator.SetBool("Catch", false);
    animator.SetBool("Toss", true);
}

@RPC
function startWalk(){
    currentSpeed = Config.WALK_SPEED;
    animator.SetFloat("Speed", 0.5);
}

@RPC
function stopWalk(){
    currentSpeed = Config.RUN_SPEED;
    animator.SetFloat("Speed", 0.2);
}

function OnTriggerEnter(other : Collider){
    var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
    var transState : AnimatorTransitionInfo = animator.GetAnimatorTransitionInfo(0);
    if(other.gameObject.CompareTag("enemy")){
        var enemyScript : EnemyScript = other.gameObject.GetComponent(EnemyScript);
        if(animState.IsName("Base Layer.AttackRight") || transState.IsUserName("startAttack") || transState.IsUserName("stopAttack")){
            enemyScript.notifyKill();
        }
        else if(networkView.isMine && enemyScript.isAlive()){
            GameObject.Find("/GameManager").networkView.RPC("killRunner", RPCMode.OthersBuffered, player.getId());
            player.kill();
            enemyScript.notifyAttack();
        }
    }
    else if(other.gameObject.CompareTag("coin")){
        other.gameObject.GetComponent(CoinScript).notifyKill();
    }
}

function OnCollisionEnter(theCollision : Collision){
    if(networkView.isMine && theCollision.gameObject.layer == LayerMask.NameToLayer("Ground Segments")){
        land();
        networkView.RPC("land", RPCMode.Others);
    }
}

//consider when character is jumping .. it will exit collision.
function OnCollisionExit(theCollision : Collision){
    if(networkView.isMine && theCollision.gameObject.layer == LayerMask.NameToLayer("Ground Segments")) {
        takeoff();
        networkView.RPC("takeoff", RPCMode.Others);
        if(platform && theCollision.gameObject.CompareTag("moveableX")){
            platform = null;
        }
    }
}

private function getCameraOffset() : Vector2 {
    var leader : Vector3 = Vector3.zero;
    for(var player : Runner in this.team.getRunners(true).Values){
        if(!Util.IsNetworkedPlayerMe(player)){
            var position : Vector3 = player.getPosition();
            position.y = runningPlane.y;
            position.z = runningPlane.z;
            var viewport : Vector3 = Camera.main.WorldToViewportPoint(position);
            if(viewport.x > leader.x && (viewport.x > Config.MAX_RUNNER_X || cameraOffset.x != 0)){
                leader = viewport;
            }
        }
    }
    if(leader != Vector3.zero){
        var maxX : float = Camera.main.ViewportToWorldPoint(Vector3(Config.MAX_RUNNER_X, leader.y, leader.z)).x;
        var leadX : float = Camera.main.ViewportToWorldPoint(leader).x;
        return Vector2(leadX - maxX, 0);
    }
    else{
        return Vector2.zero;
    }
}

/*
 *  INPUT
 */
function checkKeyboardInput(){
    if(networkView.isMine){
        if(Input.GetKeyDown(KeyCode.W)){
            jump();
            networkView.RPC("jump", RPCMode.Others);
        }
        if(Input.GetKeyDown(KeyCode.A)){
            startWalk();
            networkView.RPC("startWalk", RPCMode.Others);
        }
        if(Input.GetKeyUp(KeyCode.A)){
            stopWalk();
            networkView.RPC("stopWalk", RPCMode.Others);
        }
        if(Input.GetKeyUp(KeyCode.D)){
            attack();
            networkView.RPC("attack", RPCMode.Others);
        }
        if(Config.USE_EGG){
            if(Input.GetKeyUp(KeyCode.R)){
                toss(false);
            }
            if(Input.GetKeyUp(KeyCode.T)){
                toss(true);
            }
        }
        if(Config.DEBUG){
            if(Input.GetKeyUp(KeyCode.C)){
                grab();
                networkView.RPC("grab", RPCMode.Others);
            }
            if(Input.GetKeyUp(KeyCode.K)){
                GameObject.Find("/GameManager").networkView.RPC("killRunner", RPCMode.OthersBuffered, player.getId());
                player.kill();
            }
        }
    }
}

function OnEnable(){
    if(networkView.isMine){
        if(Config.USE_EGG){
            egg = team.getEgg();
            eggScript = egg.GetComponent(EggScript);
        }

        Gesture.onSwipeE += OnSwipe;
        Gesture.onLongTapE += OnLongTap;
        Gesture.onTouchDownE += OnTouch;
        Gesture.onTouchUpE += OnRelease;
        Gesture.onMouse1DownE += OnTouch;
        Gesture.onMouse1UpE += OnRelease;
        Gesture.onMultiTapE += OnTap;
    }
}

function OnDisable(){
    if(networkView.isMine){
        Gesture.onSwipeE -= OnSwipe;
        Gesture.onLongTapE -= OnLongTap;
        Gesture.onTouchDownE -= OnTouch;
        Gesture.onTouchUpE -= OnRelease;
        Gesture.onMouse1DownE -= OnTouch;
        Gesture.onMouse1UpE -= OnRelease;
        Gesture.onMultiTapE -= OnTap;

    }
}

function OnSwipe(sw:SwipeInfo){
    // TODO - rewrite
    //Figure out what direction we are swiping
    if(sw.direction.x >= 0) {
        jump();
        networkView.RPC("jump", RPCMode.Others);
    }

    if(Config.USE_EGG){
        if(sw.direction.y >= 0  )  {
            toss(true);
        }
    }
}

//called when a long tap event is ended
function OnLongTap(tap:Tap){

}

function OnTap(tap:Tap){
    attack();
    networkView.RPC("attack", RPCMode.Others);

}

function OnTouch(pos:Vector2){
    startWalk();
    networkView.RPC("startWalk", RPCMode.Others);

}
function OnRelease(pos:Vector2){
    stopWalk();
    networkView.RPC("startWalk", RPCMode.Others);
}
