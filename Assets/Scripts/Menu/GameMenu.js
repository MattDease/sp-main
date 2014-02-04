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
private var selectCharacter : boolean = false;

public var playerList : Dictionary.<String,Player>;

private var guiHost : GuiClasses[];
private var guiObject : GuiClasses [];

var menuSkin : GUISkin;
private var backTexture : Texture2D;
private var playerTexture : Texture2D;
private var commanderTexture : Texture2D;
private var homeTexture : Texture2D;
private var startTexture : Texture2D;
private var backgroundTexutre : Texture2D;

private var selGridInt : int = 0;
private var playerTextures :Texture[ ] = new Texture[9];;

private var headerText = 60;

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
    playerTexture = Resources.Load("Textures/gui/player", Texture2D);
    homeTexture = Resources.Load("Textures/gui/home", Texture2D);
    startTexture = Resources.Load("Textures/gui/startBtn", Texture2D);
    backgroundTexutre = Resources.Load("Textures/gui/mainMenuBackground", Texture2D);


    guiHost = new GuiClasses[5];
    for (var x=0; x<guiHost.length; x++){
        guiHost[x] = new GuiClasses();
    }

    guiObject = new GuiClasses[2];
    for (var y=0; y<guiObject.length; y++){
        guiObject[y] = new GuiClasses();
    }
}

function OnGUI (){

    if(!showMenu){
        return;
    }

    GUI.skin = menuSkin;

    GUI.DrawTexture(new Rect(0,0, Screen.width, Screen.height), backgroundTexutre);

    var headerStyle : GUIStyle = GUI.skin.GetStyle("Header");
    headerStyle.fontSize = menuScript.getScale() * headerText;
    GUI.Label (new Rect (0, Screen.height/2 - Screen.height/2.5 , Screen.width, 0), "Game Name", "Header");

    if(isHosting && !Network.isServer){
        gameName = GUILayout.TextField(gameName, GUILayout.MinWidth(70));
        GUILayout.Label("Player Limit:");
        playerLimit = parseInt(GUILayout.TextField(playerLimit.ToString(), GUILayout.MinWidth(70))) || 0;
        if (GUI.Button(Rect(0,0, 120, 30), "CREATE GAME", "GreenButton")){
            netScript.startHost(playerLimit, gameName, onInitialize);
            isStartingServer = true;
        }
    }
    else if(isStartingServer){
        GUILayout.Label("Starting server. Please Wait...");
    }
    else if(Network.isClient || (isHosting && Network.isServer)){
        playerList = gameSetupScript.playerList;

        for(var n=0; n<2; n++){
            guiObject[n].textureWidth = Screen.width*0.06;
            guiObject[n].textureHeight = Screen.height*0.1;
        }

        //Home Btn
        guiObject[1].pointLocation = Points.TopRight;
        guiObject[1].updateLocation();
        if(GUI.Button(Rect(Screen.width - Screen.width*0.09,guiObject[1].offset.y - Screen.height*0.01,Screen.width*0.08,Screen.height*0.2), homeTexture, "FullImage")){
            selectCharacter = false;
            leaveFor(menus.main);
        }

        if(selectCharacter == false){

        guiHost[1].textureWidth = Screen.width*0.15;
        guiHost[1].textureHeight = Screen.height*0.2;
        guiHost[1].pointLocation = Points.Center;
        guiHost[1].updateLocation();

        //TODO -- Dynamically place player character gui as they join the room
        //Character


        for(var player:Player in playerList.Values){

            GUI.Label(Rect(0,0, Screen.width, Screen.height + 70 ), player.name + (player.isSelf ? " (me)" : ""), "WhiteText");

            if(GUI.Button(Rect(guiHost[1].offset.x,guiHost[1].offset.y,Screen.width*0.15,Screen.height*0.20), playerTexture, "FullImage")){
            selectCharacter = true;
        }
        }


        //Team, Versus, Start Buttons
        guiHost[2].textureWidth = Screen.width*0.52;
        guiHost[2].textureHeight = Screen.height*0.11;
        guiHost[2].pointLocation = Points.Center;
        guiHost[2].updateLocation();

            if(isHosting){
                GUI.Button(Rect(guiHost[2].offset.x,Screen.height-Screen.height*0.125,Screen.width*0.12,Screen.height*0.10), "TEAM", "WhiteButton");
                GUI.Button(Rect(guiHost[2].offset.x + (Screen.width*0.13 + Screen.width*0.02),Screen.height-Screen.height*0.125,Screen.width*0.12,Screen.height*0.10), "VERSUS", "WhiteButton");
                GUI.Button(Rect(guiHost[2].offset.x + (Screen.width*0.31 + Screen.width*0.03),Screen.height-Screen.height*0.13,Screen.width*0.17,Screen.height*0.11), "START", "GreenButton");
            }
        } else {
            //Back Btn
            guiObject[0].pointLocation = Points.TopLeft;
            guiObject[0].updateLocation();

            if(GUI.Button(Rect(guiObject[0].offset.x + Screen.width*0.01,guiObject[0].offset.y - Screen.height*0.01,Screen.width*0.08,Screen.height*0.2), backTexture, "FullImage")){
                selectCharacter = false;
            }
            //Characters gui
            guiObject[1].textureWidth = Screen.width*0.8;
            guiObject[1].textureHeight = Screen.height*0.8;
            guiObject[1].pointLocation = Points.Center;
            guiObject[1].updateLocation();

            guiObject[0].textureWidth = Screen.width*0.15;
            guiObject[0].textureHeight = Screen.height*0.2;

            for(var i=0; i<9; i++){
                playerTexture = Resources.Load("Textures/gui/player" + i, Texture2D);
                playerTextures[i] = playerTexture;
            }
            selGridInt = GUI.SelectionGrid (Rect (0, 0, Screen.height, Screen.width), selGridInt, playerTextures, 9);
            // for (var c=0; c<9; c++){
            //     var offsetWidth = 0;
            //     var offsetHeight = 0;
            //     if(c==0 || c==1 || c==2){offsetHeight = Screen.height*0.03;}
            //     if (c==1 || c==4 || c==7){
            //         offsetWidth = Screen.width*0.2;
            //     }
            //     if (c==2 || c==5 || c==8){offsetWidth = Screen.width*0.4;}
            //     if (c==3 || c==4 || c==5){offsetHeight = Screen.height*0.33;}
            //     if (c==6 || c==7 || c==8){offsetHeight = Screen.height*0.63;}

            //     playerTexture = Resources.Load("Textures/gui/player" + c, Texture2D);

            //     if(GUI.Button(Rect(guiObject[1].offset.x + offsetWidth, guiObject[1].offset.y + offsetHeight,  Screen.width*0.15, Screen.height*0.20), playerTexture, "FullImage")){
            //         //TODO -- select character
            //         selectCharacter = false;
            //     }
            // }

            //Commanders gui
            for(var p=0; p<3; p++){
                var h = 0;
                if(p==0){h=Screen.height*0.03;}
                if(p==1){h=Screen.height*0.33;}
                if(p==2){h =Screen.height*0.63;}

                commanderTexture = Resources.Load("Textures/gui/commander" + p, Texture2D);

                if(GUI.Button(Rect(Screen.width*0.75, guiObject[1].offset.y + h,  Screen.width*0.15, Screen.height*0.20), commanderTexture)){
                    selectCharacter = false;
                }
            }
        }
    }
}

function onInitialize(success: boolean){
    if(success){
        isStartingServer = false;
        gameSetupScript.registerPlayerRPC(playerScript.getName(), Network.player);
    }
}

function enter(isNew : boolean){
    showMenu = true;
    isHosting = isNew;

    if(Network.isClient){
        gameSetupScript.registerPlayerRPC(playerScript.getName(), Network.player);
    }
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
