#pragma strict

private var game : Game;
private var team : Team;

private var holderId : String;
private var targetId : String;
private var inTransit : boolean = false;

private var temp_speed : float = 4;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    game = GameObject.Find("/GameManager").GetComponent(GameSetupScript).game;
    // FIXME - Support multiple teams
    team = game.getTeam(0);
    team.setEgg(gameObject);

}

function FixedUpdate(){

}

function Update(){
    if(game.getState() != GameState.Playing){
        return;
    }
    var holder : Runner = Util.GetPlayerById(holderId) as Runner;
    if(networkView.isMine){
        if(inTransit){
            var target : Runner = Util.GetPlayerById(targetId) as Runner;
            if(target.isAlive()){
                if(true || Vector3.Distance(transform.position, target.getPosition()) < 0.02){
                    networkView.RPC("setHolder", RPCMode.All, target.getId());
                }
                // TODO - move egg smoothly between holder and target
                // Temporarily throw directly between
                //transform.position = Vector3.MoveTowards(transform.position, target.getPosition(), temp_speed * Time.deltaTime);
            }
            else{
                // Abort throw progress if target dies while egg is in transit
                // TODO - Implement a more elegant solution
                inTransit = false;
            }
        }
        else{
            transform.position = Util.GetPlayerById(holderId).getPosition();
        }
    }
    else if(inTransit){
        // TODO - set local z position
        // var progressPercent : float = Vector3.Distance(holder.getPosition(), transform.position) /Vector3.Distance(holder.getPosition(), target.getPosition());
        // transform.position.z = Mathf.Lerp(holder.getPosition().z, target.getPosition().z, progressPercent);
    }
}

@RPC
function setHolder(holderId : String){
    this.holderId = holderId;
    var runner : Runner = Util.GetPlayerById(holderId) as Runner;
    runner.controller.grab();
    transform.position = runner.getPosition();
    inTransit = false;
}

@RPC
function startThrow(targetId : String){
    this.targetId = targetId;
    inTransit = true;
}

function isHoldingEgg(id : String){
    if(inTransit){
        return false;
    }
    return holderId == id;
}
