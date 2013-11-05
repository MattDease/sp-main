#pragma strict

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;
var characterSelect : boolean = false;
//Gui class and variables
var Gui : GuiClasses;
var GuiCharacter : GuiClasses[];
var GuiContinue : GuiClasses;
var GuiDP : GuiClasses;
var GuiBack: GuiClasses;

enum Point4 {TopLeft, TopRight, BottomLeft, BottomRight, Center}
enum Point6 {TopLeft, TopRight, BottomLeft, BottomRight, Center}

var selectMenu;
//Textures and skins
var menuSkin : GUISkin;
var quickGameTexture : Texture2D;
var newGameTexture : Texture2D;
var joinGameTexture : Texture2D;
var observeTexture : Texture2D;
var backTexture : Texture2D;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;

    menuSkin = Resources.LoadAssetAtPath("Assets/MenuSkin.guiskin", GUISkin);
    quickGameTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/quickgame.jpg", Texture2D);
    newGameTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/newgame.jpg", Texture2D);
    joinGameTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/joingame.jpg", Texture2D);
    backTexture = Resources.LoadAssetAtPath("Assets/Textures/gui/back.jpg", Texture2D);
    
    GuiCharacter = new GuiClasses[3];
    GuiCharacter[0] = new GuiClasses();
    GuiCharacter[1] = new GuiClasses();
}

function OnGUI (){
    GUI.skin = menuSkin;
    var screenW = Screen.width;
    var screenH = Screen.height;

    Gui.textureWidth = 310;
    Gui.textureHeight = 160;
    
    GuiBack.textureWidth = backTexture.width;
    GuiBack.textureHeight = backTexture.height;

    Gui.updateLocation();
    Gui.pointLocation = Point4.Center;

    if(!showMenu){
        return;
    }
    GuiDP.pointLocation = Point4.Center;

    if (characterSelect == true){
        
        //Back Button
        if(GUI.Button(Rect(GuiBack.offset.x + GuiBack.offsetY03 ,GuiBack.offset.y + GuiBack.offsetY03 ,backTexture.width,backTexture.height), backTexture)){
          characterSelect = false;
        }

        GUI.Box(Rect (Screen.width*0.03, GuiDP.offset.y - Screen.height*0.2 - 25 , Screen.width*0.3,Screen.height*0.6), "Character");
      

        if(GUI.Button(Rect(0,Screen.height - 30, Screen.width, 30), "Ready")){
          if(selectMenu == "quick"){
            leaveFor(menus.quickplay);
          } else if (selectMenu == "join") leaveFor(menus.lobby);
            else if (selectMenu == "newGame") leaveFor(menus.host);
        }

        GuiBack.updateLocation();
        GuiDP.updateLocation();
        GuiContinue.updateLocation();
        GuiCharacter[0].updateLocation();

    } else {
    
        //TODO - replace with good UI
        GUILayout.Label("Main Menu");
        GUILayout.Label("Player: " + playerScript.getName() + ", Times Played: " + playerScript.getTimesPlayed());

         if(GUI.Button(Rect(Gui.offset.x,Gui.offset.y,130,160), quickGameTexture)){
            //leaveFor(menus.quickplay);
            characterSelect = true;
            selectMenu = "quick";
         }

         if(GUI.Button(Rect(Gui.offset.x + 150,Gui.offset.y,150,70), newGameTexture)){
            //leaveFor(menus.host);
            characterSelect = true;
            selectMenu = "newGame";
         }

         if(GUI.Button(Rect(Gui.offset.x + 150,Gui.offset.y + 90,150,70), joinGameTexture)){
            //leaveFor(menus.lobby);
            characterSelect = true;
            selectMenu = "join";
         }
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
