#pragma strict

public var countdown : AudioSource;
public var gameStart : AudioSource;
public var gameEnd : AudioSource;

function playCountdown(){
    if(countdown){
        countdown.Play();
    }
}

function playGameStart(){
    gameStart.Play();
}

function playGameEnd(){
    gameEnd.Play();
}
