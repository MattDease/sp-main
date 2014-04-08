#pragma strict

// Needs refactoring.

private var anim: Animator;
private var currentState : AnimatorStateInfo;
private var game : Game;
private var player : Player;
private var sign : GameObject;
private var isAnimating : boolean = false;
private var distance : double = 0.0;
private var egg : GameObject;
private var eggScript : EggScript;
private var prevHasEgg : boolean = false;
private var hasEgg : boolean = false;
private var forEgg : boolean = false;

function Start () {
    game = GameObject.Find("/GameManager").GetComponent(GameSetupScript).game;
    player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();
    sign = this.gameObject;
    anim = GetComponent(Animator);
}

function Update() {
    if(game.getState() != GameState.Playing){
        return;
    }

    currentState = anim.GetCurrentAnimatorStateInfo(0);

    if(!player.getSignWith(sign.name)) {
        prevHasEgg = hasEgg;
        forEgg = false;
        if(Config.USE_EGG){
            egg = player.getTeam().getEgg();
            hasEgg = false;
            if(egg){
                eggScript = egg.GetComponent(EggScript);
                if(eggScript.isHoldingEgg(player.getId())) hasEgg = true;
                else hasEgg = false;
            }
        }

        if(sign.name.Contains("2") || sign.name.Contains("4")) {
            forEgg = true;
        }

        if(prevHasEgg != hasEgg){
            if(hasEgg){
                if(sign.name.Contains("0") || sign.name.Contains("3")) {
                    Util.Toggle(gameObject, false);
                }
                if(sign.name.Contains("4")) {
                    Util.Toggle(gameObject, true);
                }
            }
            else{
                if(sign.name.Contains("4")) {
                    Util.Toggle(gameObject, false);
                }
                if(sign.name.Contains("0") || sign.name.Contains("3")) {
                    Util.Toggle(gameObject, true);
                }
            }
        }

        distance = Vector3.Distance(sign.transform.position, player.gameObject.transform.position);

        if(distance < Config.TUTORIAL_SIGN_DISTANCE && !isAnimating && !hasEgg && !sign.name.Contains("4") || distance < Config.TUTORIAL_SIGN_DISTANCE && !isAnimating && hasEgg && forEgg ){
            player.addTutorialSign(sign.name);
            anim.SetBool("Shown", true);
            GetComponent(AudioSource).Play();
            isAnimating = true;
        }



        if(isAnimating && distance > Config.TUTORIAL_SIGN_DISTANCE) {
            Destroy(sign);
        }
        prevHasEgg = hasEgg;
    }
    else {
        Destroy(sign);
    }
}
