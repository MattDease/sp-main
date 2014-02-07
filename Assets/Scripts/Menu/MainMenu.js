#pragma strict
#pragma downcast

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;

//Gui class and variables
private var guiObject : GuiClasses[];
enum Points {TopLeft, TopRight, BottomLeft, BottomRight, Center}

//Textures and skins
private var menuSkin : GUISkin;
private var quickGameTexture : Texture2D;
private var newGameTexture : Texture2D;
private var joinGameTexture : Texture2D;
private var observeTexture : Texture2D;
private var backTexture : Texture2D;
private var backgroundTexutre : Texture2D;
private var buttonText = 40;


function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;

    menuSkin = Resources.Load("MenuSkin", GUISkin);
    quickGameTexture = Resources.Load("Textures/gui/quickgame", Texture2D);
    newGameTexture = Resources.Load("Textures/gui/newgame", Texture2D);
    joinGameTexture = Resources.Load("Textures/gui/joingame", Texture2D);
    backTexture = Resources.Load("Textures/gui/back", Texture2D);
    backgroundTexutre = Resources.Load("Textures/gui/mainMenuBackground", Texture2D);

    guiObject = new GuiClasses[3];
    for (var x=0; x<guiObject.length; x++){
        guiObject[x] = new GuiClasses();
    }
}

function OnGUI (){
    GUI.skin = menuSkin;

    if(!showMenu){
        return;
    }
    GUI.DrawTexture(new Rect(0,0, Screen.width, Screen.height), backgroundTexutre);

    //Main Menu Btns
    guiObject[2].textureWidth = Screen.width*0.62;
    guiObject[2].textureHeight = Screen.height*0.55;
    guiObject[2].pointLocation = Points.Center;
    guiObject[2].updateLocation();

    var yellowStyle : GUIStyle = GUI.skin.GetStyle("YellowButton");
    var blueButton : GUIStyle = GUI.skin.GetStyle("BlueButton");
    var whiteButton : GUIStyle = GUI.skin.GetStyle("LargeWhiteButton");
    yellowStyle.fontSize = blueButton.fontSize =  whiteButton.fontSize = menuScript.getScale() * buttonText;


    if(GUI.Button(Rect(guiObject[2].offset.x ,guiObject[2].offset.y,Screen.width*0.3, Screen.height*0.55), "QUICK GAME", "LargeWhiteButton")){
        leaveFor(menus.quickplay);
    }

    if(GUI.Button(Rect(guiObject[2].offset.x + Screen.width*0.32,guiObject[2].offset.y,Screen.width*0.3,Screen.height*0.25), "NEW GAME", "YellowButton")){
        leaveFor(menus.host);
    }

    if(GUI.Button(Rect(guiObject[2].offset.x + Screen.width*0.32,guiObject[2].offset.y + Screen.height*0.3,Screen.width*0.3,Screen.height*0.25), "JOIN GAME", "BlueButton")){
        leaveFor(menus.lobby);
    }

}

function enter(){
    showMenu = true;
}

function leaveFor(newMenu : menus){

    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
