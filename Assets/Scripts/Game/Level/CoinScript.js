#pragma strict

private var game : Game;
private var player : Player;
private var alive : boolean;
private var teamId : int;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    var gameManager : GameObject = GameObject.Find("/GameManager");
    game = gameManager.GetComponent(GameSetupScript).game;
    player = gameManager.GetComponent(PlayerScript).getSelf();
    alive = true;
}

@RPC
function initCoin(teamId : int, hostTeam : boolean){
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
    syncKill();
    networkView.RPC("syncKill", RPCMode.OthersBuffered);
}

@RPC
function syncKill(){
    alive = false;
    Util.Toggle(gameObject, false);
    game.getTeam(teamId).collectCoin();
}
