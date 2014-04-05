#pragma strict

private var game : Game;
private var team : Team;

public var inTransit : boolean = false;
public var holder : Runner;
public var target : Runner;

private var cachedThrowOffset : Vector3;
private var throwDelay : float = 0.37;
private var throwDuration : float = 1;
private var throwHeight : float = 2.2;
private var throwTime : float;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    game = GameObject.Find("/GameManager").GetComponent(GameSetupScript).game;
}

function FixedUpdate(){

}

function Update(){
    if(game.getState() != GameState.Playing){
        return;
    }
    if(!inTransit){
        transform.position = holder.getPosition();
    }
    else{
        var transitPercent : float = (Time.time - throwTime) / throwDuration;
        transitPercent = Mathf.Clamp(transitPercent, 0, 1);
        var offsetY : float = Mathf.Sin((180 * transitPercent) * Mathf.Deg2Rad) * throwHeight;
        offsetY = Mathf.Clamp(offsetY, 0, throwHeight);
        var originPos : Vector3 = target.getPosition() - cachedThrowOffset;
        transform.position = Vector3.Lerp(originPos, target.getPosition(), transitPercent);
        transform.position.y += offsetY;
        if(networkView.isMine && transitPercent > 0.99){
            networkView.RPC("setHolder", RPCMode.All, target.getId());
        }
    }
}

@RPC
function setHolder(holderId : String){
    if(!this.team){
        this.team = Util.GetPlayerById(holderId).getTeam();
        this.team.setEgg(gameObject);
    }
    this.holder = Util.GetPlayerById(holderId) as Runner;
    this.holder.controller.grab();
    inTransit = false;
}

@RPC
function startThrow(targetId : String){
    target = Util.GetPlayerById(targetId) as Runner;
    Invoke("throwEgg", throwDelay);
}

function throwEgg(){
    throwTime = Time.time;
    inTransit = true;
    cachedThrowOffset = target.getPosition() - holder.getPosition();
}

function isHoldingEgg(id : String){
    if(inTransit){
        return false;
    }
    return holder.getId() == id;
}
