﻿#pragma strict

static public var script : Menu;

public var gameManager : GameObject;
public enum menus {
    start,
    main,
    lobby,
    quickplay,
    host
};


private var startMenuScript : StartMenu;
private var mainMenuScript : MainMenu;
private var lobbyMenuScript : LobbyMenu;
private var gameMenuScript : GameMenu;

function Awake(){
    script = this;

    gameManager = GameObject.Find("/GameManager");

    startMenuScript = GetComponent(StartMenu);
    mainMenuScript = GetComponent(MainMenu);
    lobbyMenuScript = GetComponent(LobbyMenu);
    gameMenuScript = GetComponent(GameMenu);

    open(menus.start);
}

function open(menuName : menus){
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
        case menus.host:
            gameMenuScript.enter(true);
            break;
        default:
            Debug.LogError("Unknown menu: " + menuName);
            break;
    }
}
