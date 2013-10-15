#pragma strict

public enum menu {
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
    startMenuScript = GetComponent(StartMenu);
    mainMenuScript = GetComponent(MainMenu);
    lobbyMenuScript = GetComponent(LobbyMenu);
    gameMenuScript = GetComponent(GameMenu);

    OpenMenu(menu.start);
}

function OpenMenu(menuName : menu){
    switch (menuName){
        case menu.start:
            //init start menu
            break;
        case menu.main:
            //init main menu
            break;
        case menu.lobby:
            //init lobby menu
            break;
        case menu.quickplay:
            //init quickplay
            break;
        case menu.host:
            //init game menu
            break;
        default:
            Debug.LogError("Unknown menu: " + menuName);
            break;
    }
}
