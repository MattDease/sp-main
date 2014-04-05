#pragma strict

public var attack : AudioSource;
public var death : AudioSource;
public var jump : AudioSource;
public var throwing : AudioSource;
public var catching : AudioSource;

function playAttack(){
    if(!attack.isPlaying){
        attack.Play();
    }
}

function playDeath(){
    death.Play();
}

function playJump(){
    jump.Play();
}

function playThrow(){
    throwing.Play();
}

function playCatch(){
    catching.Play();
}
