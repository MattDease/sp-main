#pragma strict
#pragma downcast

private var gameManager : GameObject;
private var menuScript : Menu;
private var playerScript : PlayerScript;
private var gameSetupScript : GameSetup;
private var netScript : Net;

private var showMenu : boolean = false;
private var isHosting : boolean = false;
private var isStartingServer : boolean = false;
private var gameName : String;
private var playerLimit : int = 4;

private var playerList : List.<Player>;

var GuiHost : GuiClasses[];
var menuSkin : GUISkin;
var backTexture : Texture2D;

function Awake(){
    netScript = GetComponent(Net);
}

function Start(){
    menuScript = Menu.script;
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    gameSetupScript = gameManager.GetComponent(GameSetup);

    gameName = playerScript.getName() + "'s Game";

    //persist game manager object between scenes
    DontDestroyOnLoad( gameManager );

    menuSkin = Resources.Load("MenuSkin", GUISkin);
    backTexture = Resources.Load("Textures/gui/back", Texture2D);

    GuiHost = new GuiClasses[5];
    GuiHost[0] = new GuiClasses();
    GuiHost[1] = new GuiClasses();
    GuiHost[2] = new GuiClasses();
    GuiHost[3] = new GuiClasses();
    GuiHost[4] = new GuiClasses();
}

function OnGUI (){
    if(!showMenu){
        return;
    }

    //TODO - replace with good UI
    GUILayout.Label("Game Menu" + (isHosting ? " - Host" : ""));
    GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed());

    if(isHosting && !Network.isServer){
        GUILayout.Label("Game Name:");
        gameName = GUILayout.TextField(gameName, GUILayout.MinWidth(70));
        GUILayout.Label("Player Limit:");
        playerLimit = parseInt(GUILayout.TextField(playerLimit.ToString(), GUILayout.MinWidth(70))) || 0;
        if (GUILayout.Button ("Start Server")){
            netScript.startHost(playerLimit, gameName, onInitialize);
            isStartingServer = true;
        }
    }
    else if(isStartingServer){
        GUILayout.Label("Starting server. Please Wait...");
    }
    else if(Network.isClient || (isHosting && Network.isServer)){
        playerList = gameSetupScript.playerList;
        GUILayout.Label("Players:");
        for(var player:Player in playerList){
            GUILayout.Label(" - " + player.name + (player.isSelf ? " (me)" : ""));
        }

        GUI.skin = menuSkin;
        GuiHost[0].textureHeight = Screen.height*0.4;

        GuiHost[1].textureHeight = 50;
        GuiHost[1].textureWidth = 200;

        GuiHost[2].textureHeight = 30;
        GuiHost[2].textureWidth = 90;

        GuiHost[3].textureHeight = 30;
        GuiHost[3].textureWidth = 90;

        GuiHost[4].textureHeight = backTexture.height;
        GuiHost[4].textureWidth = backTexture.width;

        var bgHeight : int;

        for(var x=0; x<4; x++){
            GuiHost[x].pointLocation = GuiHost[x].Point.Center;
            GuiHost[x].updateLocation();
        }
        GuiHost[4].pointLocation = GuiHost[x].Point.TopLeft;
        GuiHost[4].updateLocation();

        if(Screen.height< 500){
            bgHeight = Screen.height*0.47;
        }
        else bgHeight = Screen.height*0.30;

        if(isHosting == true){
            GUI.Box(Rect (0,GuiHost[0].offset.y - Screen.height*0.1,Screen.width, bgHeight), "");

        //Back Button
        if(GUI.Button(Rect(GuiHost[4].offset.x + GuiHost[4].offsetY03 ,GuiHost[4].offset.y + GuiHost[4].offsetY03 ,backTexture.width,backTexture.height), backTexture)){
           leaveFor(menus.main);
        }

        if(GUI.Button(Rect(GuiHost[2].offset.x - (40 + 15),GuiHost[2].offset.y - Screen.height*0.20,90,30), "TEAM")){
        }

        if(GUI.Button(Rect(GuiHost[3].offset.x + (40 + 15),GuiHost[3].offset.y - Screen.height*0.20,90,30), "VERSUS")){
        }

        if (Screen.height>500){
            if(GUI.Button(Rect(GuiHost[1].offset.x,GuiHost[1].offset.y - Screen.height*0.10,200,50), "Start Game")){
                gameSetupScript.enterGame();
            }
        }
        else
            if(GUI.Button(Rect(GuiHost[1].offset.x,GuiHost[1].offset.y,200,50), "Start Game")){
                gameSetupScript.enterGame();
            }
        }
    }
}

function onInitialize(success: boolean){
    if(success){
        isStartingServer = false;
        gameSetupScript.registerPlayerRPC(playerScript.getName());
    }
}

function enter(isNew : boolean){
    showMenu = true;
    isHosting = isNew;

    if(Network.isClient){
        gameSetupScript.registerPlayerRPC(playerScript.getName());
    }
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
