#pragma strict

import System.Collections.Generic;

// Set in editor
public var cameraPrefab : GameObject;

public var depth : float = 0;

private var player : Commander;
private var model : GameObject;
private var animator : Animator;
private var team : Team;
private var camContainer : GameObject;

private var touched : boolean = false;
private var plane : Plane = new Plane(Vector3(0, 1, Config.COMMANDER_DEPTH_OFFSET),
                                      Vector3(1, 1, Config.COMMANDER_DEPTH_OFFSET),
                                      Vector3(1, 0, Config.COMMANDER_DEPTH_OFFSET));
private var targetPosition : Vector3;
private var targetRotation : Quaternion;
private var velocity : Vector3 = Vector3.zero;
private var offsetX : float = 0;
private var platform : GameObject;
private var platformOffset : Vector2 = Vector2.zero;

function OnNetworkInstantiate (info : NetworkMessageInfo) {

}

@RPC
function initCommander(playerId : String, teamId : int){
    player = Util.GetPlayerById(playerId) as Commander;
    team = player.getTeam();
    model = gameObject.transform.Find("model").gameObject;
    animator = model.GetComponent(Animator);

    player.gameObject = gameObject;
    player.script = this;

    if(networkView.isMine){
        camContainer = Instantiate(cameraPrefab, Vector3.zero,  Quaternion.identity);
        Camera.main.transparencySortMode = TransparencySortMode.Orthographic;

        var playerPosition : Vector3 = gameObject.transform.position;
        var viewport : Vector3 = Camera.main.WorldToViewportPoint(playerPosition);
        viewport.x = 0.5;
        viewport.y = 0.8;
        transform.position = Camera.main.ViewportToWorldPoint(viewport);

        rigidbody.interpolation = RigidbodyInterpolation.Interpolate;
    }
    else{
        var me : Player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();
        transform.position.z = Config.COMMANDER_DEPTH_OFFSET + (teamId == me.getTeamId() ? 0 : Config.TEAM_DEPTH_OFFSET);
        depth = transform.position.z;
    }
}

// Do physics changes here
function FixedUpdate(){
    if(networkView.isMine){

    }
}

function Update(){
    var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
    if(animState.IsName("Base Layer.Attack") && !animator.IsInTransition(0)){
        animator.SetBool("attack", false);
    }
    if(networkView.isMine){
        if(touched){
            var currentPosition : Vector3 = player.getPosition();
            transform.position = Vector3.SmoothDamp(currentPosition, targetPosition, velocity, Config.COMMANDER_SMOOTH_TIME);
            var angleZ : float = Mathf.Atan2(targetPosition.y - currentPosition.y, targetPosition.x - currentPosition.x) * Mathf.Rad2Deg;
            var angleY : float = 0;
            if(angleZ < -90 || angleZ > 90){
                angleZ += (angleZ > 0 ? -180 : 180);
                angleZ *= -1;
                angleY = 180;
            }
            targetRotation = Quaternion.Euler(0, angleY, angleZ);

            var hit : RaycastHit;
            if (Physics.Raycast(transform.position, Vector3.forward, hit, 4)){
                if(hit.collider.gameObject.CompareTag("enemy")){
                    hit.collider.gameObject.GetComponent(EnemyScript).notifyKill();
                    attack();
                    networkView.RPC("attack", RPCMode.Others);
                }
                if(!platform){
                    if(Vector3.Distance(transform.position, targetPosition) < 0.3){
                        if(hit.collider.gameObject.CompareTag("moveableX") || hit.collider.gameObject.CompareTag("moveableY")){
                            platform = hit.collider.gameObject;
                            platformOffset = platform.transform.position - transform.position;
                        }
                    }
                }
            }
            if(platform){
                var position : Vector3 = platform.transform.position;
                if(platform.CompareTag("moveableX")){
                    position.x = player.getPosition().x + platformOffset.x;
                }
                else if(platform.CompareTag("moveableY")){
                    position.y = player.getPosition().y + platformOffset.y;
                }
                platform.GetComponent(PlatformScript).notifyPosition(position);
            }
        }
        else{
            targetRotation = Quaternion.identity;
        }
        checkKeyboardInput();
    }
}

function LateUpdate(){
    if(networkView.isMine && team.isAlive()){
        var currentTeamPosition : Vector3 = team.getObserverCameraPosition();
        if(!touched){
            transform.position.x = currentTeamPosition.x + offsetX;
        }
        camContainer.transform.position.x = currentTeamPosition.x;
        camContainer.transform.position.y = currentTeamPosition.y/2;
        model.transform.rotation = Quaternion.Slerp(model.transform.rotation, targetRotation, Time.deltaTime * 10);
    }
}

function OnCollisionEnter(theCollision : Collision){

}

function OnCollisionExit(theCollision : Collision){

}

function setOffset(){
    offsetX = transform.position.x - team.getObserverCameraPosition().x;
}

@RPC
function attack(){
    animator.SetBool("attack", true);
}

/*
 *  INPUT
 */
function checkKeyboardInput(){
    if(networkView.isMine){
        if(Config.DEBUG){
            if(Input.GetKeyDown(KeyCode.A)){
                networkView.RPC("attack", RPCMode.All);
            }
        }
    }
}

function OnEnable(){
    if(networkView.isMine){
        setOffset();

        touched = false;

        Gesture.onTouchE += OnTouch;
        Gesture.onMouse1E += OnTouch;
        Gesture.onTouchDownE += OnTouchStart;
        Gesture.onMouse1DownE += OnTouchStart;
        Gesture.onTouchUpE += OnTouchEnd;
        Gesture.onMouse1UpE += OnTouchEnd;
    }
}

function OnDisable(){
    if(networkView.isMine){
        touched = false;

        Gesture.onTouchE -= OnTouch;
        Gesture.onMouse1E -= OnTouch;
        Gesture.onTouchDownE -= OnTouchStart;
        Gesture.onMouse1DownE -= OnTouchStart;
        Gesture.onTouchUpE -= OnTouchEnd;
        Gesture.onMouse1UpE -= OnTouchEnd;
    }
}

function OnTouch(pos:Vector2){
    var ray : Ray = Camera.main.ScreenPointToRay(pos);
    var rayDistance : float;
    if(plane.Raycast(ray, rayDistance)) {
        targetPosition = ray.GetPoint(rayDistance);
    }
}

function OnTouchStart(pos:Vector2){
    var ray : Ray = Camera.main.ScreenPointToRay(pos);
    var rayDistance : float;
    if(plane.Raycast(ray, rayDistance)) {
        targetPosition = ray.GetPoint(rayDistance);
    }
    touched = true;
}

function OnTouchEnd(pos:Vector2){
    setOffset();
    platform = null;
    platformOffset = Vector2.zero;
    touched = false;
}
