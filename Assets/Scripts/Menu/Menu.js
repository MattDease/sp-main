﻿#pragma strict

static public var script : Menu;

public var gameManager : GameObject;
public var playerScript : PlayerScript;
public var stateScript : StateScript;
public var style : GUIStyle;

private var startMenuScript : StartMenu;
private var mainMenuScript : MainMenu;
private var lobbyMenuScript : LobbyMenu;
private var gameMenuScript : GameMenu;
private var highscoreMenuScript : HighscoreMenu;
private var optimizedHeight : float = 1024;

function Awake(){
    script = this;

    gameManager = GameObject.Find("/GameManager");

    startMenuScript = GetComponent(StartMenu);
    mainMenuScript = GetComponent(MainMenu);
    lobbyMenuScript = GetComponent(LobbyMenu);
    gameMenuScript = GetComponent(GameMenu);
    highscoreMenuScript = GetComponent(HighscoreMenu);

}

function Start(){
    playerScript = gameManager.GetComponent(PlayerScript);
    stateScript = gameManager.GetComponent(StateScript);

    if(Config.MUTE_SOUND){
        GetComponentInChildren(AudioListener).volume = 0;
    }

    open();
}

function open(){
    var menuName : menus = stateScript.getCurrentMenu();
    switch (menuName){
        case menus.start:
            startMenuScript.enter();
            break;
        case menus.main:
            mainMenuScript.enter();
            break;
        case menus.lobby:
            lobbyMenuScript.enter(false);
            break;
        case menus.quickplay:
            lobbyMenuScript.enter(true);
            break;
        case menus.game:
            gameMenuScript.enter(false);
            break;
        case menus.host:
            gameMenuScript.enter(true);
            break;
        case menus.highscore:
            highscoreMenuScript.enter();
            break;
        default:
            Debug.LogError("Unknown menu: " + menuName);
            break;
    }
}

function getScale () : float
{
    return Screen.height / optimizedHeight;
}
