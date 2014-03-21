#pragma strict

public var type : EnemyType;

private var game : Game;
private var model : GameObject;
private var animator : Animator;

private var speed : float;
private var distance : float;
private var alive : boolean;
private var startTime : float;
private var start : Vector3;
private var end : Vector3;
private var typeCount : int;
private var idle : boolean = false;
private var player : Player;
private var teamId : int;
private var isPlaying : boolean = false;
private var lastWormAttack : float = 0;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    alive = true;
    var gameManager : GameObject =  GameObject.Find("/GameManager");
    player = gameManager.GetComponent(PlayerScript).getSelf();
    game = gameManager.GetComponent(GameSetupScript).game;

    model = transform.Find("model").gameObject;
    animator = model.GetComponent(Animator);
}

@RPC
function initEnemy(teamId : int, hostTeam : boolean){
    if(!hostTeam){
        transform.position.z -= Config.TEAM_DEPTH_OFFSET;
    }
    this.teamId = teamId;
    transform.position.z += (teamId == player.getTeamId()) ? 0 : Config.TEAM_DEPTH_OFFSET;
}

function init(pt1 : Vector3, pt2 : Vector3, typeCount : int){
    // TODO adjust based on difficulty
    speed  = Random.Range(0.0, 0.2) + (type == EnemyType.Cardinal ? Config.CARDINAL_SPEED : Config.WASP_BEETLE_SPEED);
    start = pt1;
    end = pt2;
    this.typeCount = typeCount;
    distance = Vector3.Distance(pt1, pt2);
    if((type == EnemyType.Cardinal) || (type == EnemyType.Worm)){
        idle = true;
    }
}

function Update(){
    var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
    if(animState.IsName("Base Layer.Attack") && !animator.IsInTransition(0)){
        if(type != EnemyType.Cardinal){
            animator.SetBool("attack", false);
        }
    }
    if(animState.IsName("Base Layer.Idle") && !animator.IsInTransition(0)){
        if(type == EnemyType.Worm && !idle){
            idle = true;
            lastWormAttack = Time.time;
        }
    }

    if(!networkView.isMine || !isAlive() || game.getState() != GameState.Playing || !game.getTeam(teamId).isAlive()){
        return;
    }

    if(!isPlaying){
        isPlaying = true;
        if(type == EnemyType.Worm){
            lastWormAttack = Time.time + (typeCount%3 * Config.WORM_DELAY_OFFSET);
        }
    }

    if(type == EnemyType.Cardinal){
        if(idle && end.x - game.getTeam(teamId).getLeader().getPosition().x < Config.CARDINAL_TRIGGER_DISTANCE){
            idle = false;
            startTime = Time.time;
            notifyAttack();
        }
        if(!idle){
            var progress : float = ((Time.time - startTime) * speed)/distance;
            transform.position = Vector3.Lerp(start, end, progress);
            if(progress > 0.99){
                notifyKill();
            }
        }
    }
    else if(type == EnemyType.Worm){
        if(Time.time - lastWormAttack > Config.WORM_DELAY && idle){
            idle = false;
            notifyAttack();
        }
    }
    else if(speed){
        var pt : float = Mathf.PingPong(Time.time * speed, 1);
        var newPosition : Vector3 = Vector3.Lerp(start, end, pt);
        var rotationY : float = (newPosition.x - transform.position.x > 0) ? 0 : 180;
        if(rotationY != transform.rotation.y){
            networkView.RPC("rotate", RPCMode.All, rotationY);
        }
        transform.position = newPosition;
    }
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
function rotate(degrees : float){
    transform.rotation.y = degrees;
}

@RPC
function kill(){
    networkView.RPC("syncKill", RPCMode.All);
}

@RPC
function syncKill(){
    alive = false;
    animator.SetBool("death", true);
    var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
    Invoke("hide", animState.length);
}

function notifyAttack(){
    if(alive){
        if(Network.isServer){
            attack();
        }
        else{
            networkView.RPC("attack", RPCMode.Server);
        }
    }
}

@RPC
function attack(){
    networkView.RPC("syncAttack", RPCMode.All);
}

@RPC
function syncAttack(){
    animator.SetBool("attack", true);
}

function hide(){
    Util.Toggle(gameObject, false);
}
