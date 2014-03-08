#pragma strict

private var anim: Animator;
private var currentState : AnimatorStateInfo;


function Start () {

}

function Update () {

}

function FixedUpdate() {
    anim = GetComponent(Animator);
    currentState = anim.GetCurrentAnimatorStateInfo(0);

    if(Input.GetKey('m')){
        anim.SetBool("Shown", true);
    }
    if(Input.GetKey('n')){
        anim.SetBool("Shown", false);
    }
}
