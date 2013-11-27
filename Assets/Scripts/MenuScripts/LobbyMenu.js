#pragma strict

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;
private var isQuickplay : boolean = false;

var GuiLobby : GuiClasses[];
var menuSkin : GUISkin;
var observeTexture : Texture2D;
var backTexture : Texture2D;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;

    menuSkin = Resources.LoadAssetAtPath("Assets/MenuSkin.guiskin", GUISkin);
    observeTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/observe.jpg", Texture2D);
    backTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/back.jpg", Texture2D);

    GuiLobby = new GuiClasses[2];
    GuiLobby[0] = new GuiClasses();
    GuiLobby[1] = new GuiClasses();
}

function OnGUI (){
    if(!showMenu){
        return;
    }
    GUI.skin = menuSkin;

    GuiLobby[0].textureWidth = observeTexture.width;
    GuiLobby[0].textureHeight = observeTexture.height;
    
    GuiLobby[1].textureWidth = backTexture.width;
    GuiLobby[1].textureHeight = backTexture.height;

    GuiLobby[0].pointLocation = GuiLobby[0].Point.TopRight;
    GuiLobby[1].pointLocation = GuiLobby[1].Point.TopLeft;

    for(var x =0; x<GuiLobby.length - 1; x++){
        GuiLobby[x].updateLocation();
    }
    // TODO Implement networking to poll masterserver so a list of active
    // games can be displayed

    GUI.Box(Rect (0,GuiLobby[0].offset.y + GuiLobby[0].offsetY30 ,Screen.width,30), "Waiting For.....Slow Friends");

    //Observe Button
    if(GUI.Button(Rect(GuiLobby[0].offset.x - GuiLobby[0].offsetY03 ,GuiLobby[0].offset.y + GuiLobby[0].offsetY03 ,observeTexture.width,observeTexture.height), observeTexture)){
    }

    //Back Button
    if(GUI.Button(Rect(GuiLobby[1].offset.x + GuiLobby[1].offsetY03 ,GuiLobby[1].offset.y + GuiLobby[1].offsetY03 ,backTexture.width,backTexture.height), backTexture)){
        leaveFor(menus.main);    
    }
}

function enter(quickplay : boolean){
    showMenu = true;
    isQuickplay = quickplay;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
