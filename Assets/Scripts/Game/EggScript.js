#pragma strict

private var game : Game;
private var team : Team;

public var inTransit : boolean = false;
public var holder : Runner;
public var target : Runner;

private var temp_speed : float = 4;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    game = GameObject.Find("/GameManager").GetComponent(GameSetupScript).game;
}

function FixedUpdate(){

}

function Update(){
    if(game.getState() != GameState.Playing){
        return;
    }
    if(networkView.isMine){
        if(inTransit){
            if(target.isAlive()){
                if(Vector3.Distance(transform.position, target.getPosition()) < 0.2){
                    networkView.RPC("setHolder", RPCMode.All, target.getId());
                }
                // Temporarily throw directly between
                transform.position = Vector3.MoveTowards(transform.position, target.getPosition(), temp_speed * Time.deltaTime);
            }
            else{
                // Abort throw progress if target dies while egg is in transit
                // TODO - Implement a more elegant solution
                inTransit = false;
                setHolder(holder.getId());
            }
        }
        else{
            transform.position = holder.getPosition();
        }
    }
    else {
         // set local z position
        if(inTransit){
            var progressPercent : float = Vector3.Distance(holder.getPosition(), transform.position) / Vector3.Distance(holder.getPosition(), target.getPosition());
            transform.position.z = Mathf.Lerp(holder.getPosition().z, target.getPosition().z, progressPercent);
        }
        else{
            transform.position.z = holder.getPosition().z;
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
    transform.position = this.holder.getPosition();
    transform.position.z = this.holder.gameObject.GetComponent(RunnerScript).depth;
    inTransit = false;
    GetComponent(EggSyncScript).enabled = true;
}

@RPC
function startThrow(targetId : String){
    this.target = Util.GetPlayerById(targetId) as Runner;
    inTransit = true;
}

function isHoldingEgg(id : String){
    if(inTransit){
        return false;
    }
    return holder.getId() == id;
}
