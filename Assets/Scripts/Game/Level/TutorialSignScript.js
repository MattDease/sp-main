#pragma strict

private var anim: Animator;
private var currentState : AnimatorStateInfo;
private var player : Player;
private var sign : GameObject;
private var isAnimating : boolean = false;
private var distance : double = 0.0;
private var egg : GameObject;
private var eggScript : EggScript;
private var hasEgg : boolean = false;
private var forEgg : boolean = false;

function Start () {
    player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();
    sign = this.gameObject;
    anim = GetComponent(Animator);
}

function Update() {
    currentState = anim.GetCurrentAnimatorStateInfo(0);

    if(!player.getSignWith(sign.name)) {

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

        distance = Vector3.Distance(sign.transform.position, player.gameObject.transform.position);

        if(distance < Config.TUTORIAL_SIGN_DISTANCE && !isAnimating && !hasEgg || distance < Config.TUTORIAL_SIGN_DISTANCE && !isAnimating && hasEgg && forEgg ){
            player.addTutorialSign(sign.name);
            anim.SetBool("Shown", true);
            GetComponent(AudioSource).Play();
            isAnimating = true;
        }



        if(isAnimating && distance > Config.TUTORIAL_SIGN_DISTANCE) {
            Destroy(sign);
        }
    }
    else {
        Destroy(sign);
    }
}
