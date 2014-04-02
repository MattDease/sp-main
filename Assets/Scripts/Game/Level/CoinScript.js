#pragma strict

private var game : Game;
private var player : Player;
private var alive : boolean;
private var animator : Animator;
private var teamId : int;

function OnNetworkInstantiate (info : NetworkMessageInfo) {

}

@RPC
function initCoin(teamId : int, hostTeam : boolean){
    var gameManager : GameObject = GameObject.Find("/GameManager");
    game = gameManager.GetComponent(GameSetupScript).game;
    player = gameManager.GetComponent(PlayerScript).getSelf();
    animator = transform.Find("skin").gameObject.GetComponent(Animator);
    alive = true;

    if(!hostTeam){
        transform.position.z -= Config.TEAM_DEPTH_OFFSET;
    }
    this.teamId = teamId;
    transform.position.z += (teamId == player.getTeamId()) ? 0 : Config.TEAM_DEPTH_OFFSET;
}


function isAlive(){
    return alive;
}

function notifyKill(){
    if(alive){
        if(Network.isServer){
            kill();
        }
        else{
            networkView.RPC("kill", RPCMode.Server);
        }
    }
}

@RPC
function kill(){
    networkView.RPC("syncKill", RPCMode.All);
}

@RPC
function syncKill(){
    alive = false;
    transform.GetComponent(AudioSource).Play();
    animator.SetBool("death", true);
    game.getTeam(teamId).collectCoin();
    var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
    Invoke("hide", animState.length);
}

function hide(){
    Util.Toggle(gameObject, false);
}
