#pragma strict

private var gameManager : GameObject;
private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;
private var isHosting : boolean = false;

var GuiHost : GuiClasses[];
enum Point5 {TopLeft, TopRight, BottomLeft, BottomRight, Center}
var menuSkin : GUISkin;
var backTexture : Texture2D;

function Start(){
    menuScript = Menu.script;
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);

    //persist game manager object between scenes
    DontDestroyOnLoad( gameManager );

    menuSkin = Resources.LoadAssetAtPath("Assets/MenuSkin.guiskin", GUISkin);
    backTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/back.jpg", Texture2D);

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
        GuiHost[x].pointLocation = Point5.Center;
        GuiHost[x].updateLocation();
    }
    GuiHost[4].pointLocation = Point5.TopLeft;
    GuiHost[4].updateLocation();

    if(Screen.height< 500){
        bgHeight = Screen.height*0.47;
    }
    else bgHeight = Screen.height*0.30;

    if(isHosting == true){
        GUI.Box(Rect (0,GuiHost[0].offset.y - Screen.height*0.1,Screen.width, bgHeight), "");
    
    //TODO - replace with good UI
    //GUILayout.Label("Game Menu" + (isHosting ? " - Host" : ""));
    //GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed());

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
            Application.LoadLevel("scene-game");
        }
    } else 

        if(GUI.Button(Rect(GuiHost[1].offset.x,GuiHost[1].offset.y,200,50), "Start Game")){
            Application.LoadLevel("scene-game");
        }
    }

}

function enter(isNew : boolean){
    showMenu = true;
    isHosting = isNew;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
