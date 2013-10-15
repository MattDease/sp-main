#pragma strict

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
            //init lobby menu
            break;
        case menus.quickplay:
            //init quickplay
            break;
        case menus.host:
            //init game menu
            break;
        default:
            Debug.LogError("Unknown menu: " + menuName);
            break;
    }
}
